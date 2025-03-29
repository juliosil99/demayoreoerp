
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/components/payments/PaymentForm";

type PaymentWithRelations = Payment & {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
};

type UsePaymentsQueryProps = {
  page?: number;
  pageSize?: number;
};

export function usePaymentsQuery({ page = 1, pageSize = 30 }: UsePaymentsQueryProps = {}) {
  const { user } = useAuth();
  
  // For counting total items
  const countQuery = useQuery({
    queryKey: ["payments-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // For getting paginated data
  const paymentsQuery = useQuery({
    queryKey: ["payments", user?.id, page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          sales_channels (name),
          bank_accounts (name)
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data as unknown as PaymentWithRelations[];
    },
    enabled: !!user,
  });

  return {
    data: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading || countQuery.isLoading,
    totalCount: countQuery.data || 0,
    error: paymentsQuery.error || countQuery.error,
  };
}
