-- Solución atómica definitiva para creación de empresas
-- Paso 1: Eliminar restricciones duplicadas en company_users
ALTER TABLE public.company_users DROP CONSTRAINT IF EXISTS company_users_user_id_company_id_key;

-- Paso 2: Desactivar el trigger problemático
DROP TRIGGER IF EXISTS on_company_created ON public.companies;

-- Paso 3: Crear función atómica para crear empresa con usuario
CREATE OR REPLACE FUNCTION public.create_company_with_user(
  p_nombre text,
  p_rfc text,
  p_codigo_postal text,
  p_regimen_fiscal text,
  p_direccion text DEFAULT NULL,
  p_telefono text DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
  success boolean,
  company_id uuid,
  error_code text,
  error_message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id uuid;
  v_rfc_exists boolean;
BEGIN
  -- Verificar si el usuario tiene permiso
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RETURN QUERY SELECT false, NULL::uuid, 'UNAUTHORIZED'::text, 'No autorizado'::text;
    RETURN;
  END IF;

  -- Verificar si ya existe una empresa con este RFC para este usuario
  SELECT EXISTS(
    SELECT 1 FROM public.companies 
    WHERE rfc = p_rfc AND user_id = p_user_id
  ) INTO v_rfc_exists;
  
  IF v_rfc_exists THEN
    RETURN QUERY SELECT false, NULL::uuid, 'RFC_EXISTS'::text, 'Ya tienes una empresa registrada con este RFC'::text;
    RETURN;
  END IF;

  -- Crear la empresa
  INSERT INTO public.companies (
    nombre, rfc, codigo_postal, regimen_fiscal, direccion, telefono, user_id
  ) VALUES (
    p_nombre, p_rfc, p_codigo_postal, p_regimen_fiscal, p_direccion, p_telefono, p_user_id
  ) RETURNING id INTO v_company_id;

  -- Insertar usuario como admin (con manejo de duplicados)
  INSERT INTO public.company_users (company_id, user_id, role)
  VALUES (v_company_id, p_user_id, 'admin')
  ON CONFLICT (company_id, user_id) DO NOTHING;

  -- Inicializar catálogo de cuentas básico
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id) VALUES
    -- Activos Circulantes
    ('100', 'ACTIVOS CIRCULANTES', 'asset', 1, p_user_id),
    ('101', 'Caja', 'asset', 2, p_user_id),
    ('102', 'Bancos', 'asset', 2, p_user_id),
    ('103', 'Clientes', 'asset', 2, p_user_id),
    ('104', 'Inventarios', 'asset', 2, p_user_id),
    ('105', 'IVA Acreditable', 'asset', 2, p_user_id),
    -- Activos Fijos
    ('200', 'ACTIVOS FIJOS', 'asset', 1, p_user_id),
    ('201', 'Mobiliario y Equipo', 'asset', 2, p_user_id),
    ('202', 'Equipo de Transporte', 'asset', 2, p_user_id),
    ('203', 'Depreciación Acumulada', 'asset', 2, p_user_id),
    -- Pasivos Circulantes
    ('300', 'PASIVOS CIRCULANTES', 'liability', 1, p_user_id),
    ('301', 'Proveedores', 'liability', 2, p_user_id),
    ('302', 'Acreedores Diversos', 'liability', 2, p_user_id),
    ('303', 'IVA Trasladado', 'liability', 2, p_user_id),
    ('304', 'ISR por Pagar', 'liability', 2, p_user_id),
    -- Capital
    ('400', 'CAPITAL', 'equity', 1, p_user_id),
    ('401', 'Capital Social', 'equity', 2, p_user_id),
    ('402', 'Resultado del Ejercicio', 'equity', 2, p_user_id),
    ('403', 'Utilidades Retenidas', 'equity', 2, p_user_id),
    -- Ingresos
    ('500', 'INGRESOS', 'income', 1, p_user_id),
    ('501', 'Ventas', 'income', 2, p_user_id),
    ('502', 'Otros Ingresos', 'income', 2, p_user_id),
    -- Gastos
    ('600', 'GASTOS', 'expense', 1, p_user_id),
    ('601', 'Gastos de Administración', 'expense', 2, p_user_id),
    ('602', 'Gastos de Venta', 'expense', 2, p_user_id),
    ('603', 'Gastos Financieros', 'expense', 2, p_user_id),
    ('604', 'Otros Gastos', 'expense', 2, p_user_id)
  ON CONFLICT (code, user_id) DO NOTHING;

  -- Inicializar permisos de usuario
  PERFORM public.initialize_user_permissions(p_user_id, 'admin');

  -- Retornar éxito
  RETURN QUERY SELECT true, v_company_id, NULL::text, NULL::text;

EXCEPTION
  WHEN unique_violation THEN
    -- Manejar violación de restricción única
    IF SQLSTATE = '23505' THEN
      RETURN QUERY SELECT false, NULL::uuid, 'DUPLICATE_COMPANY'::text, 'Ya existe una empresa con este RFC en el sistema'::text;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, 'DATABASE_ERROR'::text, 'Error en la base de datos'::text;
    END IF;
  WHEN OTHERS THEN
    -- Manejar otros errores
    RETURN QUERY SELECT false, NULL::uuid, 'UNKNOWN_ERROR'::text, 'Error desconocido: ' || SQLERRM;
END;
$$;

-- Paso 4: Crear función de actualización de empresa
CREATE OR REPLACE FUNCTION public.update_company_data(
  p_nombre text,
  p_rfc text,
  p_codigo_postal text,
  p_regimen_fiscal text,
  p_direccion text DEFAULT NULL,
  p_telefono text DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
  success boolean,
  error_code text,
  error_message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rfc_exists boolean;
  v_current_rfc text;
BEGIN
  -- Verificar si el usuario tiene permiso
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RETURN QUERY SELECT false, 'UNAUTHORIZED'::text, 'No autorizado'::text;
    RETURN;
  END IF;

  -- Obtener RFC actual de la empresa del usuario
  SELECT rfc INTO v_current_rfc
  FROM public.companies 
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Verificar si cambió el RFC y si ya existe
  IF v_current_rfc != p_rfc THEN
    SELECT EXISTS(
      SELECT 1 FROM public.companies 
      WHERE rfc = p_rfc AND user_id = p_user_id
    ) INTO v_rfc_exists;
    
    IF v_rfc_exists THEN
      RETURN QUERY SELECT false, 'RFC_EXISTS'::text, 'Ya tienes una empresa registrada con este RFC'::text;
      RETURN;
    END IF;
  END IF;

  -- Actualizar la empresa
  UPDATE public.companies 
  SET 
    nombre = p_nombre,
    rfc = p_rfc,
    codigo_postal = p_codigo_postal,
    regimen_fiscal = p_regimen_fiscal,
    direccion = p_direccion,
    telefono = p_telefono
  WHERE user_id = p_user_id;

  -- Retornar éxito
  RETURN QUERY SELECT true, NULL::text, NULL::text;

EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT false, 'DUPLICATE_RFC'::text, 'El RFC ya está registrado en el sistema'::text;
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'UNKNOWN_ERROR'::text, 'Error desconocido: ' || SQLERRM;
END;
$$;