-- Add selected_invoice_id column to account_transfers table to link transfers with selected invoices
ALTER TABLE account_transfers 
ADD COLUMN selected_invoice_id BIGINT REFERENCES invoices(id);