-- Crear función para recalcular reconciled_amount en pagos existentes
-- Este script corrige el problema donde reconciled_amount no considera payment_adjustments

CREATE OR REPLACE FUNCTION fix_reconciled_amounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_record RECORD;
    sales_total NUMERIC;
    adjustments_total NUMERIC;
    net_amount NUMERIC;
BEGIN
    -- Iterar sobre todos los pagos reconciliados
    FOR payment_record IN 
        SELECT id, reconciled_amount
        FROM payments 
        WHERE is_reconciled = true 
        AND reconciled_amount IS NOT NULL
    LOOP
        -- Calcular total de ventas para este pago
        SELECT COALESCE(SUM(price), 0) INTO sales_total
        FROM "Sales"
        WHERE reconciliation_id = payment_record.id;
        
        -- Calcular total de adjustments para este pago
        SELECT COALESCE(SUM(amount), 0) INTO adjustments_total
        FROM payment_adjustments
        WHERE payment_id = payment_record.id;
        
        -- Calcular monto neto (ventas - adjustments)
        net_amount := sales_total - adjustments_total;
        
        -- Redondear a 2 decimales
        net_amount := ROUND(net_amount, 2);
        
        -- Actualizar solo si hay diferencia
        IF ABS(payment_record.reconciled_amount - net_amount) > 0.001 THEN
            UPDATE payments 
            SET reconciled_amount = net_amount
            WHERE id = payment_record.id;
            
            -- Log para debugging
            RAISE LOG 'Updated payment %: reconciled_amount changed from % to % (sales: %, adjustments: %)', 
                payment_record.id, 
                payment_record.reconciled_amount, 
                net_amount,
                sales_total,
                adjustments_total;
        END IF;
    END LOOP;
END;
$$;

-- Ejecutar la función para corregir datos históricos
SELECT fix_reconciled_amounts();