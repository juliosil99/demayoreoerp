
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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

  const updateInvoicesInBatch = async (batchId: string, invoiceItems: BatchItem[]) => {
    if (invoiceItems.length === 0) return;

    console.log(`Updating ${invoiceItems.length} invoices for batch ${batchId}`);

    const invoiceIds = invoiceItems.map(item => parseInt(item.id));
    
    const { error } = await supabase
      .from('invoices')
      .update({ 
        processed: true,
        reconciliation_batch_id: batchId
      })
      .in('id', invoiceIds);

    if (error) {
      console.error('Error updating invoices in batch:', error);
      throw new Error(`Failed to update invoices: ${error.message}`);
    }

    console.log(`Successfully updated ${invoiceIds.length} invoices in batch ${batchId}`);
  };

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
      console.log('Creating batch reconciliation with items:', selectedItems);

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

      console.log(`Created batch ${batchNumber} with ID ${batch.id}`);

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

      console.log(`Created ${batchItems.length} batch items`);

      // Actualizar facturas que forman parte del lote
      const invoiceItems = selectedItems.filter(item => item.type === 'invoice');
      if (invoiceItems.length > 0) {
        await updateInvoicesInBatch(batch.id, invoiceItems);
        console.log(`Updated ${invoiceItems.length} invoices as processed`);
      }

      // Invalidar queries para refrescar la UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["optimized-invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["reconciliation-batches"] })
      ]);

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
  }, [user?.id, selectedItems, description, notes, isBalanced, calculateTotal, queryClient]);

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
