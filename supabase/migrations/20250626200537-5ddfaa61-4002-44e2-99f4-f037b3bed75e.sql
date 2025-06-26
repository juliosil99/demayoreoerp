
-- Crear índices para optimizar las consultas de reconciliación
-- Índice compuesto para la consulta principal de gastos no reconciliados
CREATE INDEX IF NOT EXISTS idx_expenses_reconciliation_lookup 
ON expenses (user_id, reconciled) 
WHERE reconciled IS NULL OR reconciled = false;

-- Índice para búsquedas por supplier_id (usado en joins)
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_id 
ON expenses (supplier_id);

-- Índice para búsquedas por chart_account_id (usado en joins)
CREATE INDEX IF NOT EXISTS idx_expenses_chart_account_id 
ON expenses (chart_account_id);

-- Índice para búsquedas por account_id (usado en joins)
CREATE INDEX IF NOT EXISTS idx_expenses_account_id 
ON expenses (account_id);

-- Índice para ordenamiento por fecha
CREATE INDEX IF NOT EXISTS idx_expenses_date_desc 
ON expenses (date DESC);

-- Índices para facturas
-- Índice compuesto para búsquedas por RFC del emisor
CREATE INDEX IF NOT EXISTS idx_invoices_issuer_rfc 
ON invoices (issuer_rfc);

-- Índice compuesto para búsquedas por RFC del receptor
CREATE INDEX IF NOT EXISTS idx_invoices_receiver_rfc 
ON invoices (receiver_rfc);

-- Índice para facturas no procesadas
CREATE INDEX IF NOT EXISTS idx_invoices_processed 
ON invoices (processed) 
WHERE processed = false;

-- Índice para tipo de factura (útil para filtrar nómina)
CREATE INDEX IF NOT EXISTS idx_invoices_type 
ON invoices (invoice_type);

-- Índice para ordenamiento por fecha de factura
CREATE INDEX IF NOT EXISTS idx_invoices_date_desc 
ON invoices (invoice_date DESC);

-- Índices para company_users (usado para obtener usuarios de la empresa)
CREATE INDEX IF NOT EXISTS idx_company_users_company_id 
ON company_users (company_id);

-- Índices para accounts_payable
CREATE INDEX IF NOT EXISTS idx_accounts_payable_expense_id 
ON accounts_payable (expense_id);

-- Índices para contacts
CREATE INDEX IF NOT EXISTS idx_contacts_user_id 
ON contacts (user_id);
