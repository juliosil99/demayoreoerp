
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);
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

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await generateReport();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="w-full sm:w-auto">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Reporte
        </Button>
      </div>
      <div className="min-h-[400px] p-2 sm:p-4 border rounded-lg">
        {!reportData ? (
          <p className="text-center text-muted-foreground">
            Seleccione un rango de fechas y genere el reporte
          </p>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Entradas de Efectivo</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Ventas Cobradas</span>
                    <span className="font-medium text-green-600 text-xs sm:text-sm">{formatAmount(reportData.inflows.sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Otros Pagos Recibidos</span>
                    <span className="font-medium text-green-600 text-xs sm:text-sm">{formatAmount(reportData.inflows.payments)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-xs sm:text-sm">Total Entradas</span>
                    <span className="font-medium text-green-600 text-xs sm:text-sm">{formatAmount(reportData.inflows.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Salidas de Efectivo</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Gastos Pagados</span>
                    <span className="font-medium text-red-500 text-xs sm:text-sm">({formatAmount(reportData.outflows.expenses)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-xs sm:text-sm">Total Salidas</span>
                    <span className="font-medium text-red-500 text-xs sm:text-sm">({formatAmount(reportData.outflows.total)})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Flujo Neto de Efectivo</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="flex justify-between">
                  <span className="font-bold text-xs sm:text-sm">Total</span>
                  <span className={`font-bold text-xs sm:text-sm ${reportData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
