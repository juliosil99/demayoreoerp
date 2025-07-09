-- Solución 1: Eliminar trigger y función problemática
-- Esto resolverá el error "column reference 'company_id' is ambiguous"

-- 1. Eliminar el trigger problemático
DROP TRIGGER IF EXISTS on_company_created ON public.companies;

-- 2. Eliminar la función problemática que causa conflictos
DROP FUNCTION IF EXISTS public.handle_new_company_with_accounts();

-- 3. Agregar función de logging para debugging futuro
CREATE OR REPLACE FUNCTION public.log_company_creation_event(
  company_id UUID,
  user_id UUID,
  event_type TEXT,
  details TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple logging que se puede expandir más tarde
  RAISE LOG 'Company Creation Event: company_id=%, user_id=%, event=%, details=%', 
    company_id, user_id, event_type, COALESCE(details, 'none');
END;
$$;

-- 4. Mejorar la función create_company_with_user_simple con logging
CREATE OR REPLACE FUNCTION public.create_company_with_user_simple(
  p_nombre text,
  p_rfc text,
  p_codigo_postal text,
  p_regimen_fiscal text,
  p_direccion text DEFAULT NULL,
  p_telefono text DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE(success boolean, company_id uuid, error_code text, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id uuid;
  v_rfc_exists boolean;
BEGIN
  -- Log inicio del proceso
  PERFORM public.log_company_creation_event(NULL, p_user_id, 'START', 'Creating company with RFC: ' || p_rfc);
  
  -- Verificar autorización
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    PERFORM public.log_company_creation_event(NULL, p_user_id, 'ERROR', 'Unauthorized access attempt');
    RETURN QUERY SELECT false, NULL::uuid, 'UNAUTHORIZED'::text, 'No autorizado'::text;
    RETURN;
  END IF;

  -- Verificar RFC duplicado
  SELECT EXISTS(
    SELECT 1 FROM public.companies 
    WHERE rfc = p_rfc AND user_id = p_user_id
  ) INTO v_rfc_exists;
  
  IF v_rfc_exists THEN
    PERFORM public.log_company_creation_event(NULL, p_user_id, 'ERROR', 'RFC already exists: ' || p_rfc);
    RETURN QUERY SELECT false, NULL::uuid, 'RFC_EXISTS'::text, 'Ya tienes una empresa registrada con este RFC'::text;
    RETURN;
  END IF;

  -- Crear empresa
  INSERT INTO public.companies (
    nombre, rfc, codigo_postal, regimen_fiscal, direccion, telefono, user_id
  ) VALUES (
    p_nombre, p_rfc, p_codigo_postal, p_regimen_fiscal, p_direccion, p_telefono, p_user_id
  ) RETURNING id INTO v_company_id;

  PERFORM public.log_company_creation_event(v_company_id, p_user_id, 'COMPANY_CREATED', 'Company created successfully');

  -- Insertar usuario como admin
  INSERT INTO public.company_users (company_id, user_id, role)
  VALUES (v_company_id, p_user_id, 'admin')
  ON CONFLICT (company_id, user_id) DO NOTHING;

  PERFORM public.log_company_creation_event(v_company_id, p_user_id, 'USER_ASSIGNED', 'User assigned as admin');

  -- Inicializar catálogo de cuentas básico (simplificado)
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id) VALUES
    ('100', 'ACTIVOS CIRCULANTES', 'asset', 1, p_user_id),
    ('101', 'Caja', 'asset', 2, p_user_id),
    ('102', 'Bancos', 'asset', 2, p_user_id),
    ('500', 'INGRESOS', 'income', 1, p_user_id),
    ('501', 'Ventas', 'income', 2, p_user_id),
    ('600', 'GASTOS', 'expense', 1, p_user_id),
    ('601', 'Gastos de Administración', 'expense', 2, p_user_id)
  ON CONFLICT (code, user_id) DO NOTHING;

  PERFORM public.log_company_creation_event(v_company_id, p_user_id, 'ACCOUNTS_CREATED', 'Basic chart of accounts initialized');

  -- Inicializar permisos
  PERFORM public.initialize_user_permissions(p_user_id, 'admin');

  PERFORM public.log_company_creation_event(v_company_id, p_user_id, 'SUCCESS', 'Company registration completed');

  -- Retornar éxito
  RETURN QUERY SELECT true, v_company_id, NULL::text, NULL::text;

EXCEPTION
  WHEN unique_violation THEN
    PERFORM public.log_company_creation_event(v_company_id, p_user_id, 'ERROR', 'Unique violation: ' || SQLERRM);
    RETURN QUERY SELECT false, NULL::uuid, 'DUPLICATE_COMPANY'::text, 'Ya existe una empresa con este RFC'::text;
  WHEN OTHERS THEN
    PERFORM public.log_company_creation_event(v_company_id, p_user_id, 'ERROR', 'Unknown error: ' || SQLERRM);
    RETURN QUERY SELECT false, NULL::uuid, 'UNKNOWN_ERROR'::text, 'Error: ' || SQLERRM;
END;
$$;