
-- Paso 1: Verificar y eliminar triggers duplicados
-- Primero, eliminamos cualquier trigger duplicado que pueda estar causando el problema
DROP TRIGGER IF EXISTS create_expense_from_payable_trigger ON accounts_payable;
DROP TRIGGER IF EXISTS update_payable_status_trigger ON accounts_payable;

-- Paso 2: Crear una función mejorada que previene duplicados de forma robusta
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
    RAISE LOG 'Processing payable payment: payable_id=%, old_status=%, new_status=%', 
        NEW.id, OLD.status, NEW.status;
    
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
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Paso 3: Crear UN SOLO trigger optimizado
CREATE TRIGGER create_expense_from_payable_trigger_v2
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.create_expense_from_payable_v2();

-- Paso 4: Agregar constraint único para prevenir duplicados futuros
-- (Esto es opcional pero recomendado)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_payable_expense 
ON expenses (supplier_id, amount, date, description) 
WHERE description LIKE '%Pago de cuenta por pagar%';

-- Paso 5: Script para identificar duplicados existentes
-- Esta consulta identifica gastos duplicados potenciales
CREATE OR REPLACE VIEW duplicate_expenses_view AS
SELECT 
    e1.id as expense_id_1,
    e2.id as expense_id_2,
    e1.description,
    e1.amount,
    e1.date,
    e1.supplier_id,
    e1.created_at as created_1,
    e2.created_at as created_2
FROM expenses e1
JOIN expenses e2 ON e1.supplier_id = e2.supplier_id 
    AND e1.amount = e2.amount 
    AND e1.date = e2.date
    AND e1.description LIKE '%Pago de cuenta por pagar%'
    AND e2.description LIKE '%Pago de cuenta por pagar%'
    AND e1.id < e2.id
WHERE e1.description = e2.description
ORDER BY e1.created_at;

-- Paso 6: Función para limpiar duplicados (usar con cuidado)
CREATE OR REPLACE FUNCTION public.clean_duplicate_expenses()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    duplicate_record RECORD;
    deleted_count integer := 0;
    payable_id_from_desc text;
BEGIN
    -- Iterar sobre duplicados y eliminar el más reciente
    FOR duplicate_record IN 
        SELECT * FROM duplicate_expenses_view
    LOOP
        -- Extraer el payable_id de la descripción del gasto más reciente
        payable_id_from_desc := substring(duplicate_record.expense_id_2::text FROM 'payable - ([a-f0-9-]+)');
        
        -- Actualizar accounts_payable para que apunte al gasto más antiguo
        IF payable_id_from_desc IS NOT NULL THEN
            UPDATE accounts_payable 
            SET expense_id = duplicate_record.expense_id_1
            WHERE id::text = payable_id_from_desc;
        END IF;
        
        -- Eliminar el gasto duplicado (más reciente)
        DELETE FROM expenses WHERE id = duplicate_record.expense_id_2;
        
        deleted_count := deleted_count + 1;
        
        RAISE LOG 'Deleted duplicate expense % (kept %)', duplicate_record.expense_id_2, duplicate_record.expense_id_1;
    END LOOP;
    
    RETURN deleted_count;
END;
$function$;
