-- Add user_id to invoices table and migrate existing data to prevent cross-company data leaking

-- Step 1: Add user_id column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Step 2: Migrate existing invoice data by matching RFC with companies
-- Update invoices where the issuer_rfc matches a company's RFC
UPDATE public.invoices 
SET user_id = companies.user_id
FROM public.companies
WHERE invoices.issuer_rfc = companies.rfc
AND invoices.user_id IS NULL;

-- Update invoices where the receiver_rfc matches a company's RFC (and user_id is still null)
UPDATE public.invoices 
SET user_id = companies.user_id
FROM public.companies
WHERE invoices.receiver_rfc = companies.rfc
AND invoices.user_id IS NULL;

-- Step 3: Make user_id NOT NULL (after migration is complete)
ALTER TABLE public.invoices 
ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Update RLS policies to filter by user_id
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.invoices;

-- Create new RLS policies that filter by user_id
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Update the create_contact_from_invoice trigger function to use auth.uid()
CREATE OR REPLACE FUNCTION public.create_contact_from_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    company_rfc text;
    contact_type text;
BEGIN
    -- Obtener el RFC de la empresa del usuario (usando el user_id de la factura)
    SELECT rfc INTO company_rfc
    FROM companies
    WHERE user_id = NEW.user_id
    LIMIT 1;

    -- Determinar si es proveedor o cliente/empleado
    IF NEW.issuer_rfc != company_rfc THEN
        contact_type := 'supplier';
    ELSE
        -- Si el tipo de factura es 'N', es un empleado
        IF NEW.invoice_type = 'N' THEN
            contact_type := 'employee';
        ELSE
            contact_type := 'client';
        END IF;
    END IF;

    -- Si es proveedor, insertar datos del emisor
    IF NEW.issuer_rfc != company_rfc THEN
        INSERT INTO contacts (
            name,
            rfc,
            tax_regime,
            type,
            user_id,
            postal_code
        )
        VALUES (
            NEW.issuer_name,
            NEW.issuer_rfc,
            NEW.issuer_tax_regime,
            contact_type,
            NEW.user_id,
            NEW.receiver_zip_code
        )
        ON CONFLICT (rfc, user_id) 
        DO UPDATE SET
            type = EXCLUDED.type,
            tax_regime = EXCLUDED.tax_regime,
            name = EXCLUDED.name,
            postal_code = EXCLUDED.postal_code;
    -- Si no es proveedor, insertar datos del receptor
    ELSE
        INSERT INTO contacts (
            name,
            rfc,
            tax_regime,
            type,
            user_id,
            postal_code
        )
        VALUES (
            NEW.receiver_name,
            NEW.receiver_rfc,
            NEW.receiver_tax_regime,
            contact_type,
            NEW.user_id,
            NEW.receiver_zip_code
        )
        ON CONFLICT (rfc, user_id) 
        DO UPDATE SET
            type = EXCLUDED.type,
            tax_regime = EXCLUDED.tax_regime,
            name = EXCLUDED.name,
            postal_code = EXCLUDED.postal_code;
    END IF;

    RETURN NEW;
END;
$function$;