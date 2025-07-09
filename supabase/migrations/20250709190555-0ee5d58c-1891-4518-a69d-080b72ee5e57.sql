-- Step 1: Add company_id column to Sales table
ALTER TABLE "Sales" ADD COLUMN company_id uuid;

-- Step 2: First, let's check and fix orphaned records
-- Create a default company for orphaned sales records if needed
INSERT INTO companies (id, nombre, rfc, codigo_postal, regimen_fiscal, user_id)
SELECT 
  gen_random_uuid(),
  'Empresa Default',
  'XAXX010101000',
  '00000',
  'Régimen General',
  s.user_id
FROM "Sales" s
WHERE s.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM company_users cu WHERE cu.user_id = s.user_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM companies c WHERE c.user_id = s.user_id
  )
GROUP BY s.user_id
ON CONFLICT DO NOTHING;

-- Step 3: Populate company_id based on user_id relationships
UPDATE "Sales" 
SET company_id = (
  SELECT COALESCE(cu.company_id, c.id)
  FROM company_users cu
  FULL OUTER JOIN companies c ON c.user_id = "Sales".user_id
  WHERE cu.user_id = "Sales".user_id OR c.user_id = "Sales".user_id
  LIMIT 1
);

-- Step 4: Handle any remaining null values by assigning to first available company
UPDATE "Sales" 
SET company_id = (SELECT id FROM companies LIMIT 1)
WHERE company_id IS NULL;

-- Step 5: Set company_id as NOT NULL after populating
ALTER TABLE "Sales" ALTER COLUMN company_id SET NOT NULL;

-- Step 6: Create index for performance
CREATE INDEX idx_sales_company_id ON "Sales"(company_id);
CREATE INDEX idx_sales_user_company ON "Sales"(user_id, company_id);

-- Step 7: Create security function to validate sales access
CREATE OR REPLACE FUNCTION can_access_sales_data(sales_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user belongs to the company and has appropriate permissions
  RETURN EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid() 
    AND cu.company_id = sales_company_id
  ) OR EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = sales_company_id
    AND c.user_id = auth.uid()
  );
END;
$$;

-- Step 8: Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to delete sales data" ON "Sales";
DROP POLICY IF EXISTS "Allow authenticated users to insert sales data" ON "Sales";
DROP POLICY IF EXISTS "Allow authenticated users to read sales data" ON "Sales";
DROP POLICY IF EXISTS "Allow authenticated users to update sales data" ON "Sales";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "Sales";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "Sales";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "Sales";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "Sales";

-- Step 9: Create new company-based RLS policies
CREATE POLICY "Users can view sales from their company"
ON "Sales"
FOR SELECT
USING (can_access_sales_data(company_id));

CREATE POLICY "Users can insert sales for their company"
ON "Sales"
FOR INSERT
WITH CHECK (can_access_sales_data(company_id));

CREATE POLICY "Users can update sales from their company"
ON "Sales"
FOR UPDATE
USING (can_access_sales_data(company_id))
WITH CHECK (can_access_sales_data(company_id));

CREATE POLICY "Users can delete sales from their company"
ON "Sales"
FOR DELETE
USING (can_access_sales_data(company_id));

-- Step 10: Add foreign key constraint
ALTER TABLE "Sales" ADD CONSTRAINT fk_sales_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;