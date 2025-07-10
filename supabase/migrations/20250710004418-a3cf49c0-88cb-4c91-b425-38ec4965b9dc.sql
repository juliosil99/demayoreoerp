-- Drop the overly permissive RLS policies for bank_accounts
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON bank_accounts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bank_accounts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bank_accounts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bank_accounts;

-- Update the company members policy to be more specific and correct
DROP POLICY IF EXISTS "Company members can access bank accounts" ON bank_accounts;

-- Create new, properly scoped RLS policies for bank_accounts
CREATE POLICY "Users can view their company bank accounts" 
ON bank_accounts 
FOR SELECT 
USING (
  company_id IN (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    UNION
    SELECT c.id
    FROM companies c
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert bank accounts for their company" 
ON bank_accounts 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    UNION
    SELECT c.id
    FROM companies c
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company bank accounts" 
ON bank_accounts 
FOR UPDATE 
USING (
  company_id IN (
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
  company_id IN (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    UNION
    SELECT c.id
    FROM companies c
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company bank accounts" 
ON bank_accounts 
FOR DELETE 
USING (
  company_id IN (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    UNION
    SELECT c.id
    FROM companies c
    WHERE c.user_id = auth.uid()
  )
);