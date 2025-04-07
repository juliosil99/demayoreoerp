
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { CashFlowForecast } from "@/types/cashFlow";

interface ForecastSelectorProps {
  forecasts: CashFlowForecast[] | null | undefined;
  selectedForecastId?: string;
  forecast?: CashFlowForecast | null;
  isLoading: boolean;
  isGenerating: boolean;
  onForecastChange: (id: string) => void;
  onGenerateClick: () => void;
}

export function ForecastSelector({
  forecasts,
  selectedForecastId,
  forecast,
  isLoading,
  isGenerating,
  onForecastChange,
  onGenerateClick
}: ForecastSelectorProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-64">
          <Select
            value={selectedForecastId}
            onValueChange={onForecastChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un pronóstico" />
            </SelectTrigger>
            <SelectContent>
              {forecasts?.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedForecastId && forecast?.status === 'draft' && (
          <Button 
            onClick={onGenerateClick}
            disabled={isGenerating}
          >
            <LineChart className="mr-2 h-4 w-4" />
            Generar Pronóstico
          </Button>
        )}
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground">
        {forecast && (
          <span>
            Creado: {new Date(forecast.created_at).toLocaleDateString("es-MX")}
          </span>
        )}
      </div>
    </div>
  );
}
