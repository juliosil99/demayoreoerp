-- Drop existing permissive RLS policies for invoice_products
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON invoice_products;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON invoice_products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invoice_products;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON invoice_products;

-- Create new RLS policies that filter by user_id through invoices relationship
CREATE POLICY "Users can view their own invoice products" 
ON invoice_products 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_products.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own invoice products" 
ON invoice_products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_products.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own invoice products" 
ON invoice_products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_products.invoice_id 
    AND invoices.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_products.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own invoice products" 
ON invoice_products 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_products.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);