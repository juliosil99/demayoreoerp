
-- Eliminar políticas existentes en bank_accounts, chart_of_accounts y contacts
DROP POLICY IF EXISTS "Allow company members to access bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can manage their own chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view bank accounts for their company" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can manage bank accounts for their company" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can view their chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Users can manage their chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Users can view their contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage their contacts" ON public.contacts;

-- Habilitar RLS en caso de que no esté habilitado
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Nueva política simple: cuentas bancarias sólo accesibles para miembros de la empresa
CREATE POLICY "Company members can access bank accounts"
ON public.bank_accounts
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
    UNION
    SELECT id FROM companies WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
    UNION
    SELECT id FROM companies WHERE user_id = auth.uid()
  )
);

-- Nueva política simple: sólo el dueño puede ver, insertar, editar, borrar sus cuentas contables
CREATE POLICY "User can manage own chart of accounts"
ON public.chart_of_accounts
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Nueva política simple: sólo el dueño puede ver, insertar, editar, borrar sus contactos
CREATE POLICY "User can manage own contacts"
ON public.contacts
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
