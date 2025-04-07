
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { CashFlowForecast } from "@/types/cashFlow";

interface ForecastHeaderProps {
  forecast?: CashFlowForecast | null;
  isGenerating: boolean;
  onCreateForecastClick: () => void;
  onGenerateForecastClick: () => void;
  selectedForecastId?: string;
}

export function ForecastHeader({
  forecast,
  isGenerating,
  onCreateForecastClick,
  onGenerateForecastClick,
  selectedForecastId
}: ForecastHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Pronóstico de Flujo de Efectivo</h1>
        <p className="text-muted-foreground mt-1">
          Proyección de flujo de efectivo para las próximas 13 semanas
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        {selectedForecastId && forecast?.status !== 'draft' && (
          <Button 
            variant="outline" 
            onClick={onGenerateForecastClick}
            disabled={isGenerating}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar Pronóstico
          </Button>
        )}
        
        <Button onClick={onCreateForecastClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pronóstico
        </Button>
      </div>
    </div>
  );
}
