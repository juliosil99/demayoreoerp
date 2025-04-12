
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { addDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface IncomeStatementProps {
  userId?: string;
}

interface IncomeStatementData {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  expenses: number;
  netIncome: number;
}

export function IncomeStatement({ userId }: IncomeStatementProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const { data: reportData, refetch: generateReport } = useQuery({
    queryKey: ["income-statement", date.from, date.to],
    queryFn: async () => {
      if (!userId || !date.from || !date.to) return null;

      // Fetch sales data
      const { data: salesData, error: salesError } = await supabase
        .from("Sales")
        .select("price, cost")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (salesError) throw salesError;

      // Fetch expenses data
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (expensesError) throw expensesError;

      // Calculate totals
      const revenue = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
      const costOfSales = salesData?.reduce((sum, sale) => sum + (sale.cost || 0), 0) || 0;
      const grossProfit = revenue - costOfSales;
      const expenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const netIncome = grossProfit - expenses;

      return {
        revenue,
        costOfSales,
        grossProfit,
        expenses,
        netIncome,
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
                <CardTitle className="text-sm sm:text-base">Ingresos</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Ventas Totales</span>
                    <span className="font-medium text-xs sm:text-sm">{formatAmount(reportData.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Costo de Ventas</span>
                    <span className="font-medium text-red-500 text-xs sm:text-sm">
                      ({formatAmount(reportData.costOfSales)})
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-xs sm:text-sm">Utilidad Bruta</span>
                    <span className="font-medium text-xs sm:text-sm">{formatAmount(reportData.grossProfit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Gastos</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">Gastos Totales</span>
                  <span className="font-medium text-red-500 text-xs sm:text-sm">
                    ({formatAmount(reportData.expenses)})
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Resultado</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="flex justify-between">
                  <span className="font-bold text-xs sm:text-sm">Utilidad Neta</span>
                  <span className={`font-bold text-xs sm:text-sm ${reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(reportData.netIncome)}
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
