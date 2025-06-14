
-- Corregir la vista optimizada para transacciones bancarias
CREATE OR REPLACE VIEW bank_transactions_unified AS
SELECT 
  'expense'::text as transaction_type,
  e.id::text as transaction_id,
  e.date,
  e.description,
  e.amount,
  e.account_id,
  e.reference_number,
  e.currency,
  NULL::bigint as from_account_id,
  NULL::bigint as to_account_id,
  NULL::text as client_name,
  c.name as chart_account_name
FROM expenses e
LEFT JOIN chart_of_accounts c ON e.chart_account_id = c.id

UNION ALL

SELECT 
  'payment'::text as transaction_type,
  p.id::text as transaction_id,
  p.date,
  COALESCE('Payment from ' || cl.name, 'Payment') as description,
  p.amount,
  p.account_id,
  p.reference_number,
  'MXN'::text as currency,
  NULL::bigint as from_account_id,
  NULL::bigint as to_account_id,
  cl.name as client_name,
  NULL::text as chart_account_name
FROM payments p
LEFT JOIN contacts cl ON p.client_id = cl.id

UNION ALL

SELECT 
  'transfer_out'::text as transaction_type,
  t.id::text as transaction_id,
  t.date,
  COALESCE('Transfer to ' || ba.name, 'Transfer Out') as description,
  -t.amount_from as amount,
  t.from_account_id as account_id,
  t.reference_number,
  ba_from.currency,
  t.from_account_id,
  t.to_account_id,
  NULL::text as client_name,
  NULL::text as chart_account_name
FROM account_transfers t
LEFT JOIN bank_accounts ba ON t.to_account_id = ba.id
LEFT JOIN bank_accounts ba_from ON t.from_account_id = ba_from.id

UNION ALL

SELECT 
  'transfer_in'::text as transaction_type,
  t.id::text as transaction_id,
  t.date,
  COALESCE('Transfer from ' || ba.name, 'Transfer In') as description,
  t.amount_to as amount,
  t.to_account_id as account_id,
  t.reference_number,
  ba_to.currency,
  t.from_account_id,
  t.to_account_id,
  NULL::text as client_name,
  NULL::text as chart_account_name
FROM account_transfers t
LEFT JOIN bank_accounts ba ON t.from_account_id = ba.id
LEFT JOIN bank_accounts ba_to ON t.to_account_id = ba_to.id;
