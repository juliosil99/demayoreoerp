
-- Enable Row Level Security for the necessary tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow company members to access bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can manage their own chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;

-- Create policies for bank_accounts
CREATE POLICY "Allow company members to access bank accounts"
ON public.bank_accounts
FOR ALL
USING (public.can_access_company(auth.uid(), company_id))
WITH CHECK (public.can_access_company(auth.uid(), company_id));

-- Create policies for chart_of_accounts
CREATE POLICY "Users can manage their own chart of accounts"
ON public.chart_of_accounts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for contacts
CREATE POLICY "Users can manage their own contacts"
ON public.contacts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
