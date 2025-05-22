
-- Create trigger for Sales table to mark sales as paid when reconciled
CREATE OR REPLACE FUNCTION update_sales_after_reconciliation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the sales records with payment information
  UPDATE "Sales"
  SET 
    "statusPaid" = 'cobrado',
    "datePaid" = NEW.date
  WHERE reconciliation_id = NEW.id;
  
  -- Count and calculate total for the payment
  WITH sales_stats AS (
    SELECT COUNT(*) as count, COALESCE(SUM(price), 0) as total
    FROM "Sales"
    WHERE reconciliation_id = NEW.id
  )
  UPDATE payments
  SET 
    is_reconciled = TRUE,
    reconciled_amount = (SELECT total FROM sales_stats),
    reconciled_count = (SELECT count FROM sales_stats)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the actual trigger on the payments table
DROP TRIGGER IF EXISTS update_sales_after_reconciliation_trigger ON payments;
CREATE TRIGGER update_sales_after_reconciliation_trigger
  AFTER UPDATE OF status
  ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION update_sales_after_reconciliation();

-- Create a trigger for Sales table updates to update payment totals
CREATE OR REPLACE FUNCTION update_payment_after_sale_reconciliation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the reconciliation_id has been set (not null)
  IF NEW.reconciliation_id IS NOT NULL THEN
    -- Update the related payment with new totals
    WITH sales_stats AS (
      SELECT COUNT(*) as count, COALESCE(SUM(price), 0) as total
      FROM "Sales"
      WHERE reconciliation_id = NEW.reconciliation_id
    )
    UPDATE payments
    SET 
      is_reconciled = TRUE,
      reconciled_amount = (SELECT total FROM sales_stats),
      reconciled_count = (SELECT count FROM sales_stats)
    WHERE id = NEW.reconciliation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the Sales table
DROP TRIGGER IF EXISTS update_payment_after_sale_reconciliation_trigger ON "Sales";
CREATE TRIGGER update_payment_after_sale_reconciliation_trigger
  AFTER UPDATE OF reconciliation_id
  ON "Sales"
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_after_sale_reconciliation();
