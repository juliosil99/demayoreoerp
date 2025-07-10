
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FinancialPeriod, FinancialPeriodType } from "@/types/financial-reporting";
import { format } from "date-fns";
import { parseDateFromDB } from "@/utils/dateUtils";

interface PeriodSelectorProps {
  periodType: FinancialPeriodType;
  periods: FinancialPeriod[] | null;
  selectedPeriod: string | null;
  isLoading: boolean;
  onPeriodTypeChange: (value: FinancialPeriodType) => void;
  onPeriodChange: (value: string) => void;
  onCreatePeriods: () => void;
}

export function PeriodSelector({
  periodType,
  periods,
  selectedPeriod,
  isLoading,
  onPeriodTypeChange,
  onPeriodChange,
  onCreatePeriods,
}: PeriodSelectorProps) {
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

  const handlePeriodTypeChange = (value: string) => {
    onPeriodTypeChange(value as FinancialPeriodType);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div>
        <Label htmlFor="period-type">Tipo de Período</Label>
        <Select value={periodType} onValueChange={handlePeriodTypeChange}>
          <SelectTrigger id="period-type">
            <SelectValue placeholder="Seleccionar tipo de período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Diario</SelectItem>
            <SelectItem value="month">Mensual</SelectItem>
            <SelectItem value="quarter">Trimestral</SelectItem>
            <SelectItem value="year">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="period-select">Período</Label>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <>
            {periods && periods.length > 0 ? (
              <Select value={selectedPeriod || ''} onValueChange={onPeriodChange}>
                <SelectTrigger id="period-select">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {formatPeriodLabel(period)}
                      {period.is_closed ? ' (Cerrado)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2">
                <Select disabled>
                  <SelectTrigger id="period-select">
                    <SelectValue placeholder="No hay períodos disponibles" />
                  </SelectTrigger>
                </Select>
                <Button onClick={onCreatePeriods}>Crear Períodos</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
