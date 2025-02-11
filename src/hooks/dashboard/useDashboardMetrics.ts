
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

        // First get all reconciled invoice IDs
        const { data: relations, error: relationsError } = await supabase
          .from('expense_invoice_relations')
          .select('expense_id');

        if (relationsError) throw relationsError;

        // Get all expenses
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select('amount, id');

        if (expensesError) throw expensesError;

        // Filter out reconciled expenses
        const reconciledExpenseIds = relations?.map(r => r.expense_id) || [];
        const unreconciledExpenses = expenses?.filter(exp => !reconciledExpenseIds.includes(exp.id)) || [];

        // Fetch pending receivables
        const { data: receivablesData, error: receivablesError } = await supabase
          .from("accounts_receivable")
          .select('amount')
          .eq('status', 'pending');

        if (receivablesError) throw receivablesError;

        setMetrics({
          yesterdaySales: salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0,
          unreconciled: unreconciledExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
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
