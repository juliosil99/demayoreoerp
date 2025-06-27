
-- Crear función de trigger para reconciliar facturas al asignarlas a payables
CREATE OR REPLACE FUNCTION public.reconcile_invoice_on_payable_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Log para debugging
    RAISE LOG 'Processing payable invoice assignment: payable_id=%, old_invoice_id=%, new_invoice_id=%', 
        NEW.id, OLD.invoice_id, NEW.invoice_id;
    
    -- Caso 1: INSERT - Se asigna una factura a un nuevo payable
    IF TG_OP = 'INSERT' AND NEW.invoice_id IS NOT NULL THEN
        RAISE LOG 'Marking invoice % as reconciled for new payable %', NEW.invoice_id, NEW.id;
        
        UPDATE invoices 
        SET processed = true,
            reconciliation_batch_id = NULL -- Limpiar batch_id si existe
        WHERE id = NEW.invoice_id;
        
        RAISE LOG 'Invoice % marked as reconciled', NEW.invoice_id;
    
    -- Caso 2: UPDATE - Se cambia la asignación de factura
    ELSIF TG_OP = 'UPDATE' THEN
        -- Si se desasigna una factura (cambiar a NULL)
        IF OLD.invoice_id IS NOT NULL AND NEW.invoice_id IS NULL THEN
            RAISE LOG 'Unmarking invoice % as reconciled (removed from payable %)', OLD.invoice_id, NEW.id;
            
            -- Verificar que no esté asociada a otro payable antes de desmarcar
            IF NOT EXISTS (
                SELECT 1 FROM accounts_payable 
                WHERE invoice_id = OLD.invoice_id 
                AND id != NEW.id 
                AND status = 'paid'
            ) THEN
                UPDATE invoices 
                SET processed = false
                WHERE id = OLD.invoice_id;
                
                RAISE LOG 'Invoice % unmarked as reconciled', OLD.invoice_id;
            ELSE
                RAISE LOG 'Invoice % remains reconciled (associated with other paid payables)', OLD.invoice_id;
            END IF;
        
        -- Si se cambia de una factura a otra
        ELSIF OLD.invoice_id IS NOT NULL AND NEW.invoice_id IS NOT NULL AND OLD.invoice_id != NEW.invoice_id THEN
            RAISE LOG 'Changing invoice assignment from % to % for payable %', OLD.invoice_id, NEW.invoice_id, NEW.id;
            
            -- Desmarcar la factura anterior (si no está en otros payables pagados)
            IF NOT EXISTS (
                SELECT 1 FROM accounts_payable 
                WHERE invoice_id = OLD.invoice_id 
                AND id != NEW.id 
                AND status = 'paid'
            ) THEN
                UPDATE invoices 
                SET processed = false
                WHERE id = OLD.invoice_id;
                
                RAISE LOG 'Previous invoice % unmarked as reconciled', OLD.invoice_id;
            END IF;
            
            -- Marcar la nueva factura como reconciliada
            UPDATE invoices 
            SET processed = true,
                reconciliation_batch_id = NULL
            WHERE id = NEW.invoice_id;
            
            RAISE LOG 'New invoice % marked as reconciled', NEW.invoice_id;
        
        -- Si se asigna una factura por primera vez (NULL a valor)
        ELSIF OLD.invoice_id IS NULL AND NEW.invoice_id IS NOT NULL THEN
            RAISE LOG 'Marking invoice % as reconciled for payable %', NEW.invoice_id, NEW.id;
            
            UPDATE invoices 
            SET processed = true,
                reconciliation_batch_id = NULL
            WHERE id = NEW.invoice_id;
            
            RAISE LOG 'Invoice % marked as reconciled', NEW.invoice_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Crear el trigger que se ejecuta en INSERT y UPDATE de accounts_payable
DROP TRIGGER IF EXISTS reconcile_invoice_on_payable_assignment_trigger ON accounts_payable;

CREATE TRIGGER reconcile_invoice_on_payable_assignment_trigger
    BEFORE INSERT OR UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.reconcile_invoice_on_payable_assignment();
