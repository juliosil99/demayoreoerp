
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building, CreditCard, BanknoteIcon, ReceiptIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardMetrics {
  yesterdaySales: number;
  unreconciled: number;
  receivablesPending: number;
}

interface OldestExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  supplier_id: string | null;
  payment_method: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    yesterdaySales: 0,
    unreconciled: 0,
    receivablesPending: 0
  });
  const [oldestExpense, setOldestExpense] = useState<OldestExpense | null>(null);
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

        // Fetch oldest unreconciled expense
        let query = supabase
          .from('expenses')
          .select('id, date, description, amount, supplier_id, payment_method')
          .order('date', { ascending: true })
          .limit(1);
          
        if (reconciledExpenseIds.length > 0) {
          query = query.not('id', 'in', reconciledExpenseIds);
        }
        
        const { data: oldestExpenseData, error: oldestExpenseError } = await query.maybeSingle();

        if (oldestExpenseError) {
          console.error("Error fetching oldest expense:", oldestExpenseError);
        } else {
          setOldestExpense(oldestExpenseData);
        }

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

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Panel de Control</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas de Ayer
            </CardTitle>
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.yesterdaySales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos por Conciliar
            </CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.unreconciled)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cuentas por Cobrar
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.receivablesPending)}</div>
          </CardContent>
        </Card>
      </div>

      {oldestExpense && (
        <Card>
          <CardHeader>
            <CardTitle>Gasto más Antiguo por Conciliar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{formatDate(oldestExpense.date)}</TableCell>
                  <TableCell>{oldestExpense.description || '-'}</TableCell>
                  <TableCell>{oldestExpense.payment_method || '-'}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(oldestExpense.amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
