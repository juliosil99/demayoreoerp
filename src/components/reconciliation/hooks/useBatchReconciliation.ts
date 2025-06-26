
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BatchItem {
  id: string;
  type: 'expense' | 'invoice';
  description: string;
  amount: number;
  currency?: string;
  date?: string;
  supplier?: string;
}

export const useBatchReconciliation = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<BatchItem[]>([]);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const addItem = useCallback((item: BatchItem) => {
    setSelectedItems(prev => {
      // Verificar si el item ya está seleccionado
      if (prev.some(i => i.id === item.id && i.type === item.type)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string, type: string) => {
    setSelectedItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
  }, []);

  const calculateTotal = useCallback(() => {
    return selectedItems.reduce((total, item) => total + item.amount, 0);
  }, [selectedItems]);

  const isBalanced = useCallback(() => {
    return Math.abs(calculateTotal()) < 0.01;
  }, [calculateTotal]);

  const createBatch = useCallback(async () => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Debe seleccionar al menos un elemento");
      return;
    }

    if (!isBalanced()) {
      toast.error("El lote debe estar balanceado (total = 0)");
      return;
    }

    setIsCreating(true);

    try {
      // Generar número de lote
      const { data: batchNumber, error: numberError } = await supabase
        .rpc('generate_batch_number', { user_uuid: user.id });

      if (numberError) throw numberError;

      // Crear el lote
      const { data: batch, error: batchError } = await supabase
        .from('reconciliation_batches')
        .insert({
          user_id: user.id,
          batch_number: batchNumber,
          description: description || `Lote de reconciliación ${batchNumber}`,
          total_amount: calculateTotal(),
          notes
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Crear los items del lote
      const batchItems = selectedItems.map(item => ({
        batch_id: batch.id,
        item_type: item.type,
        item_id: item.id,
        amount: item.amount,
        description: item.description
      }));

      const { error: itemsError } = await supabase
        .from('reconciliation_batch_items')
        .insert(batchItems);

      if (itemsError) throw itemsError;

      toast.success(`Lote ${batchNumber} creado exitosamente`);
      
      // Reset state
      setSelectedItems([]);
      setDescription("");
      setNotes("");
      setIsOpen(false);

      return batch;
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Error al crear el lote de reconciliación");
    } finally {
      setIsCreating(false);
    }
  }, [user?.id, selectedItems, description, notes, isBalanced, calculateTotal]);

  const resetBatch = useCallback(() => {
    setSelectedItems([]);
    setDescription("");
    setNotes("");
  }, []);

  return {
    isOpen,
    setIsOpen,
    selectedItems,
    addItem,
    removeItem,
    description,
    setDescription,
    notes,
    setNotes,
    calculateTotal,
    isBalanced,
    createBatch,
    resetBatch,
    isCreating
  };
};
