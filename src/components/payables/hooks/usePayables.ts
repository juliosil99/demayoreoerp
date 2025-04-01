
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountPayable } from "@/types/payables";
import { toast } from "sonner";
import { PayableFormData } from "../types/payableTypes";

export function usePayables() {
  const queryClient = useQueryClient();

  const { data: payables, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_payable")
        .select(`
          *,
          client:contacts!client_id(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AccountPayable[];
    },
  });

  const createPayable = useMutation({
    mutationFn: async (data: PayableFormData) => {
      // Create a date-only string in YYYY-MM-DD format
      // This ensures we don't introduce timezone issues
      const dueDateString = data.due_date.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('accounts_payable')
        .insert([{
          client_id: data.client_id,
          invoice_id: data.invoice_id,
          amount: data.amount,
          due_date: dueDateString,
          payment_term: data.payment_term,
          notes: data.notes,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Cuenta por pagar creada exitosamente");
    },
    onError: (error) => {
      console.error('Error creating payable:', error);
      toast.error("Error al crear la cuenta por pagar");
    },
  });

  const updatePayable = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PayableFormData }) => {
      // Create a date-only string in YYYY-MM-DD format
      const dueDateString = data.due_date.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('accounts_payable')
        .update({
          client_id: data.client_id,
          invoice_id: data.invoice_id,
          amount: data.amount,
          due_date: dueDateString,
          payment_term: data.payment_term,
          notes: data.notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Cuenta por pagar actualizada exitosamente");
    },
    onError: (error) => {
      console.error('Error updating payable:', error);
      toast.error("Error al actualizar la cuenta por pagar");
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (payableId: string) => {
      const { data: payable, error: fetchError } = await supabase
        .from('accounts_payable')
        .select('invoice_id')
        .eq('id', payableId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid' })
        .eq('id', payableId);

      if (error) throw error;
      
      return !!payable.invoice_id;
    },
    onSuccess: (hasInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error) => {
      console.error('Error marking payable as paid:', error);
      toast.error("Error al marcar como pagada");
    },
  });

  return {
    payables,
    isLoading,
    createPayable,
    updatePayable,
    markAsPaid
  };
}
