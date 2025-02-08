
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface BalanceSheetProps {
  userId?: string;
}

interface BalanceSheetData {
  assets: {
    bankAccounts: number;
    accountsReceivable: number;
    total: number;
  };
  liabilities: {
    accountsPayable: number;
    total: number;
  };
  equity: {
    netIncome: number;
    total: number;
  };
}

export function BalanceSheet({ userId }: BalanceSheetProps) {
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const { data: reportData, refetch: generateReport } = useQuery({
    queryKey: ["balance-sheet", date.from, date.to],
    queryFn: async () => {
      if (!userId || !date.from || !date.to) return null;

      // Fetch bank account balances (assets)
      const { data: bankAccountsData, error: bankError } = await supabase
        .from("bank_accounts")
        .select("balance");

      if (bankError) throw bankError;

      // Fetch accounts receivable (unpaid sales)
      const { data: receivablesData, error: receivablesError } = await supabase
        .from("Sales")
        .select("price")
        .eq("statusPaid", "pending")
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (receivablesError) throw receivablesError;

      // Fetch accounts payable (unpaid expenses)
      const { data: payablesData, error: payablesError } = await supabase
        .from("accounts_payable_expenses")
        .select("amount")
        .eq("status", "pending")
        .lte("created_at", format(date.to, "yyyy-MM-dd"));

      if (payablesError) throw payablesError;

      // Calculate totals
      const bankTotal = bankAccountsData?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
      const receivablesTotal = receivablesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
      const payablesTotal = payablesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

      // Calculate net income (this is simplified - in a real app you'd want to calculate this properly)
      const { data: salesData, error: salesError } = await supabase
        .from("Sales")
        .select("price")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (salesError) throw salesError;

      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"));

      if (expensesError) throw expensesError;

      const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const netIncome = totalSales - totalExpenses;

      const totalAssets = bankTotal + receivablesTotal;
      const totalLiabilities = payablesTotal;
      const totalEquity = netIncome;

      return {
        assets: {
          bankAccounts: bankTotal,
          accountsReceivable: receivablesTotal,
          total: totalAssets,
        },
        liabilities: {
          accountsPayable: payablesTotal,
          total: totalLiabilities,
        },
        equity: {
          netIncome: netIncome,
          total: totalEquity,
        },
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
                <CardTitle>Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bancos</span>
                    <span className="font-medium">{formatAmount(reportData.assets.bankAccounts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cuentas por Cobrar</span>
                    <span className="font-medium">{formatAmount(reportData.assets.accountsReceivable)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Activos</span>
                    <span className="font-medium">{formatAmount(reportData.assets.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pasivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cuentas por Pagar</span>
                    <span className="font-medium">{formatAmount(reportData.liabilities.accountsPayable)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Pasivos</span>
                    <span className="font-medium">{formatAmount(reportData.liabilities.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Resultado del Periodo</span>
                    <span className="font-medium">{formatAmount(reportData.equity.netIncome)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Capital</span>
                    <span className="font-medium">{formatAmount(reportData.equity.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
