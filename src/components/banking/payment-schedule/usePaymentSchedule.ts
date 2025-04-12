
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, addMonths } from "date-fns";
import { BankAccount } from "@/components/banking/types";
import { CreditPayment } from "./PaymentsTable";

export function usePaymentSchedule() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    due_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0
  });
  const [generateMonths, setGenerateMonths] = useState(6);

  // Fetch account details
  const {
    data: account,
    isLoading: isLoadingAccount,
    error: accountError
  } = useQuery({
    queryKey: ["bank-account", Number(accountId)],
    queryFn: async () => {
      if (!accountId) return null;
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", parseInt(accountId))
        .single();
        
      if (error) throw error;
      return data as BankAccount;
    },
    enabled: !!accountId
  });

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
      setShowAddDialog(false);
      setNewPayment({
        due_date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0
      });
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

  // Generate payments
  const generatePayments = useMutation({
    mutationFn: async (months: number) => {
      if (!account || !account.payment_due_day) {
        throw new Error("La cuenta no tiene configurado el día de pago");
      }
      
      const payments = [];
      const amount = account.type === "Credit Card" 
        ? (account.balance ?? 0) * (account.minimum_payment_percentage ?? 10) / 100
        : account.monthly_payment ?? 0;
      
      // Create a base date using the account's payment day
      let currentDate = new Date();
      currentDate.setDate(account.payment_due_day);
      
      // If today is past the payment day, start from next month
      if (new Date().getDate() > account.payment_due_day) {
        currentDate = addMonths(currentDate, 1);
      }
      
      for (let i = 0; i < months; i++) {
        const paymentDate = addMonths(currentDate, i);
        
        payments.push({
          account_id: parseInt(accountId as string),
          due_date: format(paymentDate, 'yyyy-MM-dd'),
          amount: amount,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
      }
      
      const { error } = await supabase
        .from("credit_payment_schedules")
        .insert(payments);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
      setShowGenerateDialog(false);
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

  const handleAddPayment = () => {
    addPayment.mutate(newPayment);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment.mutate(paymentId);
  };

  const handleGeneratePayments = () => {
    generatePayments.mutate(generateMonths);
  };

  return {
    accountId,
    account,
    payments,
    isLoadingAccount,
    isLoadingPayments,
    accountError,
    paymentsError,
    navigate,
    showAddDialog,
    setShowAddDialog,
    showGenerateDialog,
    setShowGenerateDialog,
    newPayment,
    setNewPayment,
    generateMonths,
    setGenerateMonths,
    handleAddPayment,
    handleDeletePayment,
    handleGeneratePayments
  };
}
