
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataSourcesPanel } from "./forecast-generation/DataSourcesPanel";
import { ForecastOptionsPanel } from "./forecast-generation/ForecastOptionsPanel";
import { ForecastOptions } from "./forecast-generation/types";

interface GenerateForecastDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: ForecastOptions) => void;
  isLoading: boolean;
  historicalDataCount: {
    payables: number;
    receivables: number;
    expenses: number;
    sales: number;
    bankAccounts: number;
  };
}

export function GenerateForecastDialog({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  historicalDataCount
}: GenerateForecastDialogProps) {
  console.log("[DEBUG] GenerateForecastDialog - Render with props:", { 
    isOpen, 
    isLoading, 
    historicalDataCount 
  });
  
  const [options, setOptions] = useState<ForecastOptions>({
    useAI: true,
    includeHistoricalTrends: true,
    includeSeasonality: true,
    includePendingPayables: true,
    includeRecurringExpenses: true,
    forecastHorizonWeeks: 13,
    confidenceLevel: 0.8
  });

  const handleOptionChange = <K extends keyof ForecastOptions>(option: K, value: ForecastOptions[K]) => {
    console.log("[DEBUG] GenerateForecastDialog - Option changed:", { option, value });
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleGenerate = () => {
    console.log("[DEBUG] GenerateForecastDialog - Generate button clicked with options:", options);
    onGenerate(options);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("[DEBUG] GenerateForecastDialog - Dialog state changed:", open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Generar Pronóstico con IA</DialogTitle>
          <DialogDescription>
            Configure las opciones para generar su pronóstico de flujo de caja.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <DataSourcesPanel historicalDataCount={{
            ...historicalDataCount,
            bankAccountsCount: historicalDataCount.bankAccounts
          }} />
          
          <ForecastOptionsPanel 
            options={options}
            onOptionChange={handleOptionChange}
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLoading ? 'Generando...' : 'Generar Pronóstico'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
