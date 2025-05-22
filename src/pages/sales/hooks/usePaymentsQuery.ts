
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Payment } from '@/components/payments/PaymentForm';

type PaymentWithRelations = Payment & {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
  is_reconciled?: boolean;
  reconciled_amount?: number;
  reconciled_count?: number;
};

type PaymentFilter = {
  search: string;
  date?: Date;
  paymentMethod: 'all' | 'cash' | 'transfer' | 'credit_card' | 'check';
  isReconciled: boolean | 'all';
};

type PaginationState = {
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const DEFAULT_FILTERS: PaymentFilter = {
  search: '',
  date: undefined,
  paymentMethod: 'all',
  isReconciled: 'all',
};

export function usePaymentsQuery() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState<PaymentFilter>(DEFAULT_FILTERS);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const fetchPayments = async () => {
    setIsLoading(true);
    if (!user) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      // Create base query for count
      let countQuery = supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Create base query for data
      let query = supabase
        .from('payments')
        .select(`
          *,
          sales_channels (name),
          bank_accounts (name)
        `)
        .eq('user_id', user.id);

      // Apply filters
      if (filters.search) {
        const searchFilter = `%${filters.search.toLowerCase()}%`;
        query = query.or(`reference_number.ilike.${searchFilter},bank_accounts.name.ilike.${searchFilter},sales_channels.name.ilike.${searchFilter}`);
        countQuery = countQuery.or(`reference_number.ilike.${searchFilter}`);
      }

      if (filters.date) {
        const dateStr = filters.date.toISOString().split('T')[0];
        query = query.eq('date', dateStr);
        countQuery = countQuery.eq('date', dateStr);
      }

      if (filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
        countQuery = countQuery.eq('payment_method', filters.paymentMethod);
      }

      // Apply reconciliation filter
      if (filters.isReconciled !== 'all') {
        query = query.eq('is_reconciled', filters.isReconciled === true);
        countQuery = countQuery.eq('is_reconciled', filters.isReconciled === true);
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      // Get count
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      setTotalRecords(count || 0);

      // Get paginated data
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setPayments(data as PaymentWithRelations[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user, pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    // When filters change, reset to page 1
    setPagination(prev => ({
      ...prev,
      page: 1,
      totalPages: Math.max(1, Math.ceil(totalRecords / prev.pageSize)),
    }));
  }, [filters, totalRecords]);

  const updateFilters = (newFilters: PaymentFilter) => {
    setFilters(newFilters);
  };

  return {
    payments,
    isLoading,
    pagination,
    filters,
    updateFilters,
    setPagination,
    refetch: fetchPayments,
  };
}
