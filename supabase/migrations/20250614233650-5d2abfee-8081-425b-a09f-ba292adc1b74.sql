
-- Fix RLS policies for bank_accounts table
DROP POLICY IF EXISTS "Users can view company bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can create company bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can update company bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can delete company bank accounts" ON public.bank_accounts;

-- Create new RLS policies for bank_accounts that properly check company access
CREATE POLICY "Users can view bank accounts for their company"
ON public.bank_accounts
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
    UNION
    SELECT id FROM companies WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage bank accounts for their company"
ON public.bank_accounts
FOR ALL
TO authenticated
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

-- Fix RLS policies for chart_of_accounts table
DROP POLICY IF EXISTS "Users can view their chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Users can manage their chart of accounts" ON public.chart_of_accounts;

CREATE POLICY "Users can view their chart of accounts"
ON public.chart_of_accounts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their chart of accounts"
ON public.chart_of_accounts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix RLS policies for contacts table
DROP POLICY IF EXISTS "Users can view their contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage their contacts" ON public.contacts;

CREATE POLICY "Users can view their contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled on all tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
