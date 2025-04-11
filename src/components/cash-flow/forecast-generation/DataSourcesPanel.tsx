
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, Calendar, BarChart, CircleAlert, CircleCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DataSourcesPanelProps {
  historicalDataCount: {
    payables: number;
    receivables: number;
    expenses: number;
    sales: number;
    bankAccountsCount: number;
    totalBankBalance?: number;
  };
}

export function DataSourcesPanel({ historicalDataCount }: DataSourcesPanelProps) {
  // Determine if we have enough data
  const hasEnoughData = 
    historicalDataCount.bankAccountsCount > 0 && 
    (historicalDataCount.payables > 0 || 
     historicalDataCount.receivables > 0 || 
     historicalDataCount.expenses > 0 || 
     historicalDataCount.sales > 0);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Fuentes de Datos</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <Card className={`p-3 ${historicalDataCount.bankAccountsCount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardContent className="p-0 flex flex-col items-center">
            <Banknote className={`h-8 w-8 mb-1 ${historicalDataCount.bankAccountsCount > 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-xs font-medium">{historicalDataCount.bankAccountsCount} Cuentas</span>
            {historicalDataCount.totalBankBalance !== undefined && (
              <span className="text-xs mt-1">{formatCurrency(historicalDataCount.totalBankBalance)}</span>
            )}
          </CardContent>
        </Card>
        
        <Card className={`p-3 ${historicalDataCount.payables > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
          <CardContent className="p-0 flex flex-col items-center">
            <Calendar className={`h-8 w-8 mb-1 ${historicalDataCount.payables > 0 ? 'text-green-500' : 'text-amber-500'}`} />
            <span className="text-xs font-medium">{historicalDataCount.payables} Pagos</span>
          </CardContent>
        </Card>
        
        <Card className={`p-3 ${historicalDataCount.expenses > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
          <CardContent className="p-0 flex flex-col items-center">
            <BarChart className={`h-8 w-8 mb-1 ${historicalDataCount.expenses > 0 ? 'text-green-500' : 'text-amber-500'}`} />
            <span className="text-xs font-medium">{historicalDataCount.expenses} Gastos</span>
          </CardContent>
        </Card>
      </div>
      
      {!hasEnoughData && (
        <div className="flex items-center mt-2 text-amber-500 text-sm">
          <CircleAlert className="h-4 w-4 mr-2" />
          Datos limitados. El pronóstico puede ser menos preciso.
        </div>
      )}

      {hasEnoughData && (
        <div className="flex items-center mt-2 text-green-500 text-sm">
          <CircleCheck className="h-4 w-4 mr-2" />
          Datos suficientes para un pronóstico razonable.
        </div>
      )}
    </div>
  );
}
