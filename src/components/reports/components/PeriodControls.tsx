
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PeriodSelector } from "./PeriodSelector";
import { FinancialPeriod, FinancialPeriodType } from "@/types/financial-reporting";

interface PeriodControlsProps {
  periodType: FinancialPeriodType;
  periods: FinancialPeriod[] | null;
  selectedPeriod: string | null;
  isLoading: boolean;
  currentPeriod: FinancialPeriod | null;
  compareWithPreviousYear: boolean;
  onPeriodTypeChange: (value: FinancialPeriodType) => void;
  onPeriodChange: (value: string) => void;
  onCreatePeriods: () => void;
  onToggleCompare: (checked: boolean) => void;
  onClosePeriod: () => void;
}

export function PeriodControls({
  periodType,
  periods,
  selectedPeriod,
  isLoading,
  currentPeriod,
  compareWithPreviousYear,
  onPeriodTypeChange,
  onPeriodChange,
  onCreatePeriods,
  onToggleCompare,
  onClosePeriod,
}: PeriodControlsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <PeriodSelector
        periodType={periodType}
        periods={periods}
        selectedPeriod={selectedPeriod}
        isLoading={isLoading}
        onPeriodTypeChange={onPeriodTypeChange}
        onPeriodChange={onPeriodChange}
        onCreatePeriods={onCreatePeriods}
      />
      
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="compare-year" 
            checked={compareWithPreviousYear}
            onCheckedChange={onToggleCompare}
          />
          <Label htmlFor="compare-year">Comparar con año anterior</Label>
        </div>
        
        {currentPeriod && !currentPeriod.is_closed && (
          <Button 
            variant="outline" 
            onClick={onClosePeriod}
            className="whitespace-nowrap"
          >
            Cerrar Período
          </Button>
        )}
      </div>
    </div>
  );
}
