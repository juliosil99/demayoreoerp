
-- 1. Agregar columna company_id a bank_accounts
ALTER TABLE public.bank_accounts 
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- 2. Migrar datos existentes - asignar todas las cuentas existentes a la primera empresa encontrada
-- (En un entorno real, esto requeriría una estrategia más específica)
UPDATE public.bank_accounts 
SET company_id = (
  SELECT id FROM public.companies LIMIT 1
) 
WHERE company_id IS NULL;

-- 3. Hacer la columna NOT NULL después de migrar los datos
ALTER TABLE public.bank_accounts 
ALTER COLUMN company_id SET NOT NULL;

-- 4. Habilitar RLS en bank_accounts si no está habilitado
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- 5. Crear función para verificar acceso a cuentas bancarias
CREATE OR REPLACE FUNCTION public.can_access_bank_account(account_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
  has_banking_permission boolean;
BEGIN
  -- Obtener la empresa del usuario actual
  SELECT company_id INTO user_company_id
  FROM company_users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Si no se encuentra en company_users, verificar si es owner de una empresa
  IF user_company_id IS NULL THEN
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;
  
  -- Verificar si el usuario tiene permisos de banking
  SELECT COALESCE(
    (SELECT can_access FROM user_permissions 
     WHERE user_id = auth.uid() AND permission_name = 'can_view_banking'),
    public.is_admin(auth.uid())
  ) INTO has_banking_permission;
  
  -- Retornar true si la empresa coincide y tiene permisos
  RETURN (user_company_id = account_company_id AND has_banking_permission);
END;
$$;

-- 6. Crear políticas RLS para bank_accounts
DROP POLICY IF EXISTS "Users can view bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can create bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can update bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can delete bank accounts" ON public.bank_accounts;

-- Política para SELECT
CREATE POLICY "Users can view company bank accounts"
ON public.bank_accounts
FOR SELECT
TO authenticated
USING (public.can_access_bank_account(company_id));

-- Política para INSERT
CREATE POLICY "Users can create company bank accounts"
ON public.bank_accounts
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_access_bank_account(company_id) AND
  EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = 'can_manage_banking' 
    AND can_access = true
  ) OR public.is_admin(auth.uid())
);

-- Política para UPDATE
CREATE POLICY "Users can update company bank accounts"
ON public.bank_accounts
FOR UPDATE
TO authenticated
USING (public.can_access_bank_account(company_id))
WITH CHECK (
  public.can_access_bank_account(company_id) AND
  EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = 'can_manage_banking' 
    AND can_access = true
  ) OR public.is_admin(auth.uid())
);

-- Política para DELETE
CREATE POLICY "Users can delete company bank accounts"
ON public.bank_accounts
FOR DELETE
TO authenticated
USING (
  public.can_access_bank_account(company_id) AND
  (EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = 'can_manage_banking' 
    AND can_access = true
  ) OR public.is_admin(auth.uid()))
);

-- 7. Actualizar tablas relacionadas para mantener consistencia
-- Agregar company_id a account_transfers si no existe
ALTER TABLE public.account_transfers 
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- Migrar datos de account_transfers
UPDATE public.account_transfers 
SET company_id = (
  SELECT ba.company_id 
  FROM bank_accounts ba 
  WHERE ba.id = account_transfers.from_account_id
  LIMIT 1
)
WHERE company_id IS NULL;

-- Hacer NOT NULL la columna en account_transfers
ALTER TABLE public.account_transfers 
ALTER COLUMN company_id SET NOT NULL;

-- Actualizar RLS para account_transfers
ALTER TABLE public.account_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view account transfers" ON public.account_transfers;
CREATE POLICY "Users can view company account transfers"
ON public.account_transfers
FOR SELECT
TO authenticated
USING (public.can_access_bank_account(company_id));

DROP POLICY IF EXISTS "Users can create account transfers" ON public.account_transfers;
CREATE POLICY "Users can create company account transfers"
ON public.account_transfers
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_access_bank_account(company_id) AND
  (EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = auth.uid() 
    AND permission_name = 'can_manage_banking' 
    AND can_access = true
  ) OR public.is_admin(auth.uid()))
);
