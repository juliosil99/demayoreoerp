
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addMonths } from "date-fns";
import { supabase } from "@/lib/supabase";
import { BankAccount } from "@/components/banking/types";

export function usePaymentGeneration() {
  const { accountId } = useParams<{ accountId: string }>();
  const queryClient = useQueryClient();

  // Generate payments
  const generatePayments = useMutation({
    mutationFn: async (options: { 
      months: number, 
      account: BankAccount 
    }) => {
      const { months, account } = options;
      
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
    }
  });

  return { generatePayments };
}
