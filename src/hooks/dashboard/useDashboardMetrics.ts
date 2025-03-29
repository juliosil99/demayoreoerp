
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

interface DashboardMetrics {
  yesterdaySales: number;
  unreconciled: number;
  receivablesPending: number;
}

export const useDashboardMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    yesterdaySales: 0,
    unreconciled: 0,
    receivablesPending: 0
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
        // This properly accounts for both methods of reconciliation:
        // 1. Having reconciled = true (manual reconciliation)
        // 2. Having an expense_invoice_relation (automatic reconciliation)
        const { data: unreconciledExpenses, error: expensesError } = await supabase
          .from("expenses")
          .select('id, amount')
          .is('reconciled', null);  // Only get expenses where reconciled is null (not reconciled)

        if (expensesError) throw expensesError;

        // Fetch pending receivables
        const { data: receivablesData, error: receivablesError } = await supabase
          .from("accounts_receivable")
          .select('amount')
          .eq('status', 'pending');

        if (receivablesError) throw receivablesError;

        setMetrics({
          yesterdaySales: salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0,
          unreconciled: unreconciledExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0,
          receivablesPending: receivablesData?.reduce((sum, rec) => sum + (rec.amount || 0), 0) || 0
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
