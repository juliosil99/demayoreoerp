
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountPayable } from "@/types/payables";
import { toast } from "sonner";
import { format } from "date-fns";

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
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('accounts_payable')
        .insert([{
          ...data,
          due_date: format(data.due_date, 'yyyy-MM-dd'),
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Cuenta por pagar creada exitosamente");
      return true;
    },
    onError: (error) => {
      console.error('Error creating payable:', error);
      toast.error("Error al crear la cuenta por pagar");
      return false;
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
    markAsPaid
  };
}
