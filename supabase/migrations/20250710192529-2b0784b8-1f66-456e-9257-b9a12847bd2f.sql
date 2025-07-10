-- Add invoice attachment fields to account_transfers table
ALTER TABLE public.account_transfers
ADD COLUMN invoice_file_path text,
ADD COLUMN invoice_filename text,
ADD COLUMN invoice_content_type text,
ADD COLUMN invoice_size bigint;

-- Create storage bucket for transfer invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfer-invoices', 'transfer-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for transfer invoices storage
CREATE POLICY "Users can upload transfer invoices"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'transfer-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their transfer invoices"
ON storage.objects
FOR SELECT
USING (bucket_id = 'transfer-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their transfer invoices"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'transfer-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their transfer invoices"
ON storage.objects
FOR DELETE
USING (bucket_id = 'transfer-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);