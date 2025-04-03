
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastWeek } from "@/types/cashFlow";
import { ArrowUpRight, ArrowDownRight, ArrowRight, AlertCircle } from "lucide-react";

interface ForecastSummaryCardsProps {
  weeks: ForecastWeek[];
}

export function ForecastSummaryCards({ weeks }: ForecastSummaryCardsProps) {
  // Calculate summary metrics
  const totalInflows = weeks.reduce((sum, week) => sum + (week.predicted_inflows || 0), 0);
  const totalOutflows = weeks.reduce((sum, week) => sum + (week.predicted_outflows || 0), 0);
  const netCashFlow = totalInflows - totalOutflows;
  
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

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Entradas Totales</CardDescription>
          <CardTitle className="text-green-500 text-2xl">
            ${totalInflows.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
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
            ${totalOutflows.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
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
          <CardDescription>Flujo Neto</CardDescription>
          <CardTitle className={`text-2xl ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${netCashFlow.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Resultado proyectado
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs">
            <ArrowRight className="mr-1 h-4 w-4" />
            {netCashFlow >= 0 ? 'Flujo positivo' : 'Flujo negativo'}
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Semanas con Riesgo</CardDescription>
          <CardTitle className="text-2xl">
            {weeksWithNegativeCashFlow.length} de 13
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {mostCriticalWeek 
              ? `Semana ${mostCriticalWeek.week_number} es la más crítica` 
              : 'Sin semanas críticas'
            }
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs text-amber-500">
            <AlertCircle className="mr-1 h-4 w-4" />
            {weeksWithNegativeCashFlow.length > 0 
              ? 'Requiere atención' 
              : 'Sin alertas de liquidez'
            }
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
