
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/components/payments/PaymentForm";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

type PaymentWithRelations = Payment & {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
};

type UsePaymentsQueryProps = {
  page?: number;
  pageSize?: number;
  dateRange?: DateRange;
  salesChannelId?: string;
  accountId?: string;
  status?: string;
};

export function usePaymentsQuery({
  page = 1,
  pageSize = 30,
  dateRange,
  salesChannelId,
  accountId,
  status,
}: UsePaymentsQueryProps = {}) {
  const { user } = useAuth();
  
  // For counting total items with filters
  const countQuery = useQuery({
    queryKey: ["payments-count", user?.id, dateRange, salesChannelId, accountId, status],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      // Apply filters
      if (dateRange?.from) {
        query = query.gte('date', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        query = query.lte('date', format(dateRange.to, 'yyyy-MM-dd'));
      }
      if (salesChannelId) {
        query = query.eq('sales_channel_id', salesChannelId);
      }
      if (accountId) {
        query = query.eq('account_id', accountId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // For getting paginated data with filters
  const paymentsQuery = useQuery({
    queryKey: ["payments", user?.id, page, pageSize, dateRange, salesChannelId, accountId, status],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('payments')
        .select(`
          *,
          sales_channels (name),
          bank_accounts (name)
        `)
        .eq('user_id', user!.id);

      // Apply filters
      if (dateRange?.from) {
        query = query.gte('date', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        query = query.lte('date', format(dateRange.to, 'yyyy-MM-dd'));
      }
      if (salesChannelId) {
        query = query.eq('sales_channel_id', salesChannelId);
      }
      if (accountId) {
        query = query.eq('account_id', accountId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      // Apply order and pagination
      query = query.order('date', { ascending: false }).range(from, to);

      const { data, error } = await query;

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
