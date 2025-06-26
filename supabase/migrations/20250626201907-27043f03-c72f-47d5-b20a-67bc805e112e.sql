
-- Crear tabla principal para lotes de reconciliación
CREATE TABLE reconciliation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    batch_number TEXT NOT NULL,
    description TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- Crear tabla para items individuales del lote
CREATE TABLE reconciliation_batch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES reconciliation_batches(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('expense', 'invoice', 'adjustment')),
    item_id TEXT NOT NULL, -- ID del gasto, factura o ajuste
    amount NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agregar columna a expenses para referenciar el lote
ALTER TABLE expenses ADD COLUMN reconciliation_batch_id UUID REFERENCES reconciliation_batches(id);

-- Agregar columna a invoices para referenciar el lote
ALTER TABLE invoices ADD COLUMN reconciliation_batch_id UUID REFERENCES reconciliation_batches(id);

-- Crear índices para optimizar consultas
CREATE INDEX idx_reconciliation_batches_user_id ON reconciliation_batches(user_id);
CREATE INDEX idx_reconciliation_batch_items_batch_id ON reconciliation_batch_items(batch_id);
CREATE INDEX idx_expenses_reconciliation_batch_id ON expenses(reconciliation_batch_id);
CREATE INDEX idx_invoices_reconciliation_batch_id ON invoices(reconciliation_batch_id);

-- Función para generar número de lote único
CREATE OR REPLACE FUNCTION generate_batch_number(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    batch_count INTEGER;
    batch_number TEXT;
BEGIN
    -- Contar lotes existentes para el usuario
    SELECT COUNT(*) + 1 INTO batch_count
    FROM reconciliation_batches
    WHERE user_id = user_uuid;
    
    -- Generar número de lote con formato BATCH-YYYY-NNNN
    batch_number := 'BATCH-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(batch_count::TEXT, 4, '0');
    
    RETURN batch_number;
END;
$$;

-- Función para actualizar el estado de reconciliación cuando se crea un lote
CREATE OR REPLACE FUNCTION update_items_reconciliation_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar gastos que están en este lote
    UPDATE expenses 
    SET reconciled = true,
        reconciliation_date = NOW(),
        reconciliation_type = 'batch',
        reconciliation_batch_id = NEW.batch_id
    WHERE id::text IN (
        SELECT item_id 
        FROM reconciliation_batch_items 
        WHERE batch_id = NEW.batch_id AND item_type = 'expense'
    );
    
    -- Actualizar facturas que están en este lote
    UPDATE invoices 
    SET processed = true,
        reconciliation_batch_id = NEW.batch_id
    WHERE id::text IN (
        SELECT item_id 
        FROM reconciliation_batch_items 
        WHERE batch_id = NEW.batch_id AND item_type = 'invoice'
    );
    
    RETURN NEW;
END;
$$;

-- Crear trigger para actualizar estados cuando se agregan items al lote
CREATE TRIGGER trigger_update_reconciliation_status
    AFTER INSERT ON reconciliation_batch_items
    FOR EACH ROW
    EXECUTE FUNCTION update_items_reconciliation_status();

-- RLS policies
ALTER TABLE reconciliation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_batch_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reconciliation batches" ON reconciliation_batches
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reconciliation batches" ON reconciliation_batches
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reconciliation batches" ON reconciliation_batches
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own batch items" ON reconciliation_batch_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reconciliation_batches 
            WHERE id = reconciliation_batch_items.batch_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own batch items" ON reconciliation_batch_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reconciliation_batches 
            WHERE id = reconciliation_batch_items.batch_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own batch items" ON reconciliation_batch_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM reconciliation_batches 
            WHERE id = reconciliation_batch_items.batch_id 
            AND user_id = auth.uid()
        )
    );
