-- Fix para el error "column reference company_id is ambiguous"
-- Crear una versión simplificada de la función para testing

CREATE OR REPLACE FUNCTION public.create_company_with_user_simple(
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
    WHERE companies.rfc = p_rfc AND companies.user_id = p_user_id
  ) INTO v_rfc_exists;
  
  IF v_rfc_exists THEN
    RETURN QUERY SELECT false, NULL::uuid, 'RFC_EXISTS'::text, 'Ya tienes una empresa registrada con este RFC'::text;
    RETURN;
  END IF;

  -- Crear la empresa (paso 1 - solo esto)
  INSERT INTO public.companies (
    nombre, rfc, codigo_postal, regimen_fiscal, direccion, telefono, user_id
  ) VALUES (
    p_nombre, p_rfc, p_codigo_postal, p_regimen_fiscal, p_direccion, p_telefono, p_user_id
  ) RETURNING id INTO v_company_id;

  -- Insertar usuario como admin con aliases explícitos
  INSERT INTO public.company_users (company_id, user_id, role)
  VALUES (v_company_id, p_user_id, 'admin')
  ON CONFLICT (company_id, user_id) DO NOTHING;

  -- Retornar éxito sin inicializar cuentas ni permisos por ahora
  RETURN QUERY SELECT true, v_company_id, NULL::text, NULL::text;

EXCEPTION
  WHEN unique_violation THEN
    IF SQLSTATE = '23505' THEN
      RETURN QUERY SELECT false, NULL::uuid, 'DUPLICATE_COMPANY'::text, 'Ya existe una empresa con este RFC en el sistema'::text;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, 'DATABASE_ERROR'::text, 'Error en la base de datos'::text;
    END IF;
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::uuid, 'UNKNOWN_ERROR'::text, 'Error desconocido: ' || SQLERRM;
END;
$$;

-- Arreglar las políticas RLS problemáticas con aliases explícitos
-- Política para bank_accounts que podría estar causando ambigüedad
DROP POLICY IF EXISTS "Company members can access bank accounts" ON public.bank_accounts;

CREATE POLICY "Company members can access bank accounts" 
ON public.bank_accounts 
FOR ALL 
TO authenticated
USING (
  bank_accounts.company_id IN (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    UNION
    SELECT c.id
    FROM companies c
    WHERE c.user_id = auth.uid()
  )
)
WITH CHECK (
  bank_accounts.company_id IN (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    UNION
    SELECT c.id
    FROM companies c
    WHERE c.user_id = auth.uid()
  )
);

-- Arreglar políticas de account_transfers que también referencian company_id
DROP POLICY IF EXISTS "Users can create company account transfers" ON public.account_transfers;
DROP POLICY IF EXISTS "Users can view company account transfers" ON public.account_transfers;

CREATE POLICY "Users can create company account transfers" 
ON public.account_transfers 
FOR INSERT 
TO authenticated
WITH CHECK (
  can_access_bank_account(account_transfers.company_id) AND 
  (
    (EXISTS (
      SELECT 1
      FROM user_permissions up
      WHERE up.user_id = auth.uid() 
        AND up.permission_name = 'can_manage_banking'
        AND up.can_access = true
    )) 
    OR is_admin(auth.uid())
  )
);

CREATE POLICY "Users can view company account transfers" 
ON public.account_transfers 
FOR SELECT 
TO authenticated
USING (can_access_bank_account(account_transfers.company_id));