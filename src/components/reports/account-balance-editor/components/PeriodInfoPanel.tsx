
import React from "react";
import { FinancialPeriod } from "@/types/financial-reporting";

interface PeriodInfoPanelProps {
  period: FinancialPeriod | null;
  isPeriodClosed: boolean;
}

export const PeriodInfoPanel: React.FC<PeriodInfoPanelProps> = ({
  period,
  isPeriodClosed
}) => {
  if (!period) {
    return (
      <div className="text-sm text-gray-500">
        Cargando período...
      </div>
    );
  }

  const periodTypeLabel = 
    period.period_type === 'month' ? 'Mes' : 
    period.period_type === 'quarter' ? 'Trimestre' : 
    period.period_type === 'year' ? 'Año' : 'Día';
  
  return (
    <div className="space-y-2">
      <div className="text-sm">
        <span className="font-medium">Período:</span> {periodTypeLabel} {period.period} de {period.year}
      </div>
      
      {isPeriodClosed && (
        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md">
          <p className="text-yellow-800 text-sm">Este período está cerrado. Los saldos no pueden ser modificados.</p>
        </div>
      )}
    </div>
  );
};
