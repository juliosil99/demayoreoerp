
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CreditPayment } from "../PaymentsTable";

export function usePayments() {
  const { accountId } = useParams<{ accountId: string }>();
  const queryClient = useQueryClient();

  // Fetch payment schedule
  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    error: paymentsError
  } = useQuery({
    queryKey: ["credit-payments", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      
      const { data, error } = await supabase
        .from("credit_payment_schedules")
        .select("*")
        .eq("account_id", parseInt(accountId))
        .order("due_date", { ascending: true });
        
      if (error) throw error;
      return data as CreditPayment[];
    },
    enabled: !!accountId
  });

  // Add new payment
  const addPayment = useMutation({
    mutationFn: async (payment: { due_date: string, amount: number }) => {
      const { error } = await supabase
        .from("credit_payment_schedules")
        .insert({
          account_id: parseInt(accountId as string),
          due_date: payment.due_date,
          amount: payment.amount,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
    }
  });

  // Delete payment
  const deletePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("credit_payment_schedules")
        .delete()
        .eq("id", paymentId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
    }
  });

  // Check for overdue payments and update status
  useEffect(() => {
    const checkOverduePayments = async () => {
      const today = new Date();
      const overduePayments = payments.filter(p => {
        return p.status === 'pending' && new Date(p.due_date) < today;
      });
      
      if (overduePayments.length > 0) {
        const updates = overduePayments.map(p => ({
          id: p.id,
          status: 'overdue'
        }));
        
        for (const update of updates) {
          await supabase
            .from("credit_payment_schedules")
            .update({ status: 'overdue' })
            .eq("id", update.id);
        }
        
        if (updates.length > 0) {
          queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
        }
      }
    };
    
    checkOverduePayments();
  }, [payments, accountId, queryClient]);

  return {
    payments,
    isLoadingPayments,
    paymentsError,
    addPayment,
    deletePayment
  };
}
