
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

interface DashboardMetrics {
  yesterdaySales: number;
  unreconciled: number;
  receivablesPending: number;
  salesCount: number;
  unreconciledCount: number;
  receivablesCount: number;
}

export const useDashboardMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    yesterdaySales: 0,
    unreconciled: 0,
    receivablesPending: 0,
    salesCount: 0,
    unreconciledCount: 0,
    receivablesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        // Fetch yesterday's sales
        const { data: salesData, error: salesError } = await supabase
          .from("Sales")
          .select('price')
          .eq('date', yesterday);

        if (salesError) throw salesError;

        // Get all expenses that are NOT reconciled
        const { data: unreconciledExpenses, error: expensesError, count: unreconciledCount } = await supabase
          .from("expenses")
          .select('id, amount', { count: 'exact' })
          .is('reconciled', null);  // Only get expenses where reconciled is null (not reconciled)

        if (expensesError) throw expensesError;

        // Fetch pending receivables
        const { data: receivablesData, error: receivablesError, count: receivablesCount } = await supabase
          .from("accounts_receivable")
          .select('amount', { count: 'exact' })
          .eq('status', 'pending');

        if (receivablesError) throw receivablesError;

        // Fetch total sales count
        const { count: salesCount, error: salesCountError } = await supabase
          .from("Sales")
          .select('*', { count: 'exact', head: true })
          .is('statusPaid', null);

        if (salesCountError) throw salesCountError;

        setMetrics({
          yesterdaySales: salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0,
          unreconciled: unreconciledExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0,
          receivablesPending: receivablesData?.reduce((sum, rec) => sum + (rec.amount || 0), 0) || 0,
          salesCount: salesCount || 0,
          unreconciledCount: unreconciledCount || 0,
          receivablesCount: receivablesCount || 0
        });

      } catch (error) {
        console.error("Error fetching metrics:", error);
        toast.error("Error al cargar métricas del panel");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [navigate]);

  return { metrics, loading };
};
