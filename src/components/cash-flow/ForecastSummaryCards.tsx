
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastWeek, CashFlowForecast } from "@/types/cashFlow";
import { ArrowUpRight, ArrowDownRight, ArrowRight, AlertCircle, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ForecastSummaryCardsProps {
  weeks: ForecastWeek[];
  forecast?: CashFlowForecast | null;
}

export function ForecastSummaryCards({ weeks, forecast }: ForecastSummaryCardsProps) {
  // Calculate summary metrics
  const totalInflows = weeks.reduce((sum, week) => sum + (week.predicted_inflows || 0), 0);
  const totalOutflows = weeks.reduce((sum, week) => sum + (week.predicted_outflows || 0), 0);
  const netCashFlow = totalInflows - totalOutflows;
  const initialBalance = forecast?.initial_balance || 0;
  
  // Find weeks with negative cash flow
  const weeksWithNegativeCashFlow = weeks.filter(week => {
    const netFlow = (week.predicted_inflows || 0) - (week.predicted_outflows || 0);
    return netFlow < 0;
  });
  
  // Find the most critical week (biggest negative cash flow)
  let mostCriticalWeek: ForecastWeek | null = null;
  if (weeksWithNegativeCashFlow.length > 0) {
    mostCriticalWeek = weeksWithNegativeCashFlow.reduce((critical, current) => {
      const criticalNetFlow = (critical.predicted_inflows || 0) - (critical.predicted_outflows || 0);
      const currentNetFlow = (current.predicted_inflows || 0) - (current.predicted_outflows || 0);
      return currentNetFlow < criticalNetFlow ? current : critical;
    });
  }

  // Final projected balance (initial + net cash flow)
  const finalProjectedBalance = initialBalance + netCashFlow;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Saldo Inicial</CardDescription>
          <CardTitle className={`text-2xl ${initialBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {formatCurrency(initialBalance)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Basado en cuentas bancarias
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs text-blue-500">
            <Wallet className="mr-1 h-4 w-4" />
            Saldo Actual
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Entradas Totales</CardDescription>
          <CardTitle className="text-green-500 text-2xl">
            {formatCurrency(totalInflows)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            en 13 semanas
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs text-green-500">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Entradas Proyectadas
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Salidas Totales</CardDescription>
          <CardTitle className="text-red-500 text-2xl">
            {formatCurrency(totalOutflows)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            en 13 semanas
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs text-red-500">
            <ArrowDownRight className="mr-1 h-4 w-4" />
            Salidas Proyectadas
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Saldo Proyectado Final</CardDescription>
          <CardTitle className={`text-2xl ${finalProjectedBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(finalProjectedBalance)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Saldo Inicial + Flujo Neto
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs">
            <ArrowRight className="mr-1 h-4 w-4" />
            {weeksWithNegativeCashFlow.length > 0 
              ? `${weeksWithNegativeCashFlow.length} semanas con riesgo` 
              : 'Sin semanas con riesgo'}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
