
import * as React from "react";
import { FinancialPeriod } from "@/types/financial-reporting";
import { format } from "date-fns";
import { parseDateFromDB } from "@/utils/dateUtils";

interface PeriodInfoProps {
  period: FinancialPeriod;
}

export function PeriodInfo({ period }: PeriodInfoProps) {
  // Format period label for display
  const formatPeriodLabel = (period: FinancialPeriod) => {
    const startDate = parseDateFromDB(period.start_date);
    
    if (period.period_type === 'day') {
      return `${format(startDate, 'dd/MM/yyyy')}`;
    } else if (period.period_type === 'month') {
      return `${format(startDate, 'MMMM yyyy')}`;
    } else if (period.period_type === 'quarter') {
      return `Q${period.period} ${period.year}`;
    } else {
      return `${period.year}`;
    }
  };

  return (
    <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
      <p className="text-sm">
        <span className="font-medium">Período actual: </span>
        {formatPeriodLabel(period)}
        {period.is_closed && (
          <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            Cerrado
          </span>
        )}
      </p>
      <p className="text-sm">
        <span className="font-medium">Fechas: </span>
        {format(parseDateFromDB(period.start_date), 'dd/MM/yyyy')} - {format(parseDateFromDB(period.end_date), 'dd/MM/yyyy')}
      </p>
    </div>
  );
}
