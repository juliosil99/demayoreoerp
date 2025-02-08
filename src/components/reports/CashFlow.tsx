
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface CashFlowProps {
  userId?: string;
}

interface CashFlowData {
  inflows: {
    sales: number;
    payments: number;
    total: number;
  };
  outflows: {
    expenses: number;
    total: number;
  };
  netCashFlow: number;
}

export function CashFlow({ userId }: CashFlowProps) {
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const { data: reportData, refetch: generateReport } = useQuery({
    queryKey: ["cash-flow", date.from, date.to],
    queryFn: async () => {
      if (!userId || !date.from || !date.to) return null;

      // Fetch sales data (cash inflows)
      const { data: salesData, error: salesError } = await supabase
        .from("Sales")
        .select("price")
        .eq("statusPaid", "paid")
        .gte("datePaid", format(date.from, "yyyy-MM-dd"))
        .lte("datePaid", format(date.to, "yyyy-MM-dd"));

      if (salesError) throw salesError;

      // Fetch payments data (additional cash inflows)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (paymentsError) throw paymentsError;

      // Fetch expenses data (cash outflows)
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (expensesError) throw expensesError;

      // Calculate totals
      const salesTotal = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
      const paymentsTotal = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const expensesTotal = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

      const totalInflows = salesTotal + paymentsTotal;
      const totalOutflows = expensesTotal;
      const netCashFlow = totalInflows - totalOutflows;

      return {
        inflows: {
          sales: salesTotal,
          payments: paymentsTotal,
          total: totalInflows,
        },
        outflows: {
          expenses: expensesTotal,
          total: totalOutflows,
        },
        netCashFlow,
      };
    },
    enabled: false,
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <DatePickerWithRange date={date} setDate={setDate} />
        <Button onClick={() => generateReport()}>
          Generar Reporte
        </Button>
      </div>
      <div className="min-h-[400px] p-4 border rounded-lg">
        {!reportData ? (
          <p className="text-center text-muted-foreground">
            Seleccione un rango de fechas y genere el reporte
          </p>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entradas de Efectivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ventas Cobradas</span>
                    <span className="font-medium text-green-600">{formatAmount(reportData.inflows.sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Pagos Recibidos</span>
                    <span className="font-medium text-green-600">{formatAmount(reportData.inflows.payments)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Entradas</span>
                    <span className="font-medium text-green-600">{formatAmount(reportData.inflows.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salidas de Efectivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gastos Pagados</span>
                    <span className="font-medium text-red-500">({formatAmount(reportData.outflows.expenses)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Salidas</span>
                    <span className="font-medium text-red-500">({formatAmount(reportData.outflows.total)})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flujo Neto de Efectivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className={`font-bold ${reportData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(reportData.netCashFlow)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
