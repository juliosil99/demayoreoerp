
-- Update the trigger function to handle invoice reconciliation when creating expenses from payables
CREATE OR REPLACE FUNCTION public.create_expense_from_payable_v2()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    supplier_default_chart_account_id uuid;
    default_chart_account_id uuid;
    existing_expense_count integer;
    new_expense_id uuid;
BEGIN
    -- Log para debugging
    RAISE LOG 'Processing payable payment: payable_id=%, old_status=%, new_status=%, invoice_id=%', 
        NEW.id, OLD.status, NEW.status, NEW.invoice_id;
    
    -- Solo proceder si el status cambió a 'paid' y antes no era 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        
        -- Verificación robusta: contar gastos existentes vinculados a este payable
        SELECT COUNT(*) INTO existing_expense_count
        FROM expenses 
        WHERE description LIKE '%' || NEW.id || '%' 
           OR notes LIKE '%' || NEW.id || '%'
           OR (supplier_id = NEW.client_id AND amount = NEW.amount AND date = CURRENT_DATE);
        
        -- Log del resultado de la verificación
        RAISE LOG 'Existing expenses found for payable %: count=%', NEW.id, existing_expense_count;
        
        -- Si ya existe un gasto relacionado, no crear otro
        IF existing_expense_count > 0 THEN
            RAISE LOG 'Skipping expense creation - expense already exists for payable %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Verificar también si expense_id ya está asignado
        IF NEW.expense_id IS NOT NULL THEN
            RAISE LOG 'Skipping expense creation - expense_id already assigned for payable %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Obtener cuenta contable del proveedor
        SELECT c.default_chart_account_id INTO supplier_default_chart_account_id
        FROM contacts c
        WHERE c.id = NEW.client_id;
        
        -- Obtener cuenta contable por defecto como fallback
        SELECT id INTO default_chart_account_id
        FROM chart_of_accounts
        WHERE account_type = 'expense'
        AND user_id = NEW.user_id
        LIMIT 1;
        
        -- Crear el gasto con descripción única
        INSERT INTO expenses (
            user_id,
            date,
            description,
            amount,
            account_id,
            chart_account_id,
            payment_method,
            supplier_id,
            notes,
            currency,
            original_amount,
            exchange_rate
        )
        VALUES (
            NEW.user_id,
            CURRENT_DATE,
            'Pago de cuenta por pagar - ' || NEW.id,
            NEW.amount,
            1, -- Default account_id
            COALESCE(
                NEW.chart_account_id,
                supplier_default_chart_account_id,
                default_chart_account_id
            ),
            'transfer',
            NEW.client_id,
            'Generado automáticamente para payable: ' || NEW.id || COALESCE(' - ' || NEW.notes, ''),
            'MXN',
            NEW.amount,
            1.0
        )
        RETURNING id INTO new_expense_id;
        
        -- Actualizar el payable con el expense_id
        NEW.expense_id := new_expense_id;
        
        RAISE LOG 'Created expense % for payable %', new_expense_id, NEW.id;
        
        -- Si hay una factura asociada, crear la relación y marcar como reconciliada
        IF NEW.invoice_id IS NOT NULL THEN
            RAISE LOG 'Creating expense-invoice relation for expense % and invoice %', new_expense_id, NEW.invoice_id;
            
            -- Crear la relación expense-invoice
            INSERT INTO expense_invoice_relations (
                expense_id,
                invoice_id,
                amount,
                currency,
                exchange_rate,
                original_amount
            )
            VALUES (
                new_expense_id,
                NEW.invoice_id,
                NEW.amount,
                'MXN',
                1.0,
                NEW.amount
            );
            
            -- Marcar la factura como procesada/reconciliada
            UPDATE invoices 
            SET processed = true,
                reconciliation_batch_id = NULL -- Limpiar batch_id si existe
            WHERE id = NEW.invoice_id;
            
            -- Marcar el gasto como reconciliado
            UPDATE expenses
            SET reconciled = true,
                reconciliation_date = NOW(),
                reconciliation_type = 'automatic'
            WHERE id = new_expense_id;
            
            RAISE LOG 'Invoice % marked as reconciled and expense % marked as reconciled', NEW.invoice_id, new_expense_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;
