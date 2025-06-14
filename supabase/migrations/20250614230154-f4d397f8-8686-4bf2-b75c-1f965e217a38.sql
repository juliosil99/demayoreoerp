
-- Add columns to invoices table for manual reconciliation
ALTER TABLE invoices 
ADD COLUMN manually_reconciled boolean DEFAULT false,
ADD COLUMN manual_reconciliation_date timestamp with time zone,
ADD COLUMN manual_reconciliation_notes text;

-- Add index for better performance on manually_reconciled queries
CREATE INDEX idx_invoices_manually_reconciled ON invoices(manually_reconciled);
