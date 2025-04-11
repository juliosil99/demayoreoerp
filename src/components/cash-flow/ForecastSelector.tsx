
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
  console.log("[DEBUG] ForecastSelector - Render with props:", {
    forecastsCount: forecasts?.length,
    selectedForecastId,
    forecastStatus: forecast?.status,
    isLoading,
    isGenerating
  });
  
  // Check conditions for showing the generate button
  const showGenerateButton = selectedForecastId && forecast?.status === 'draft';
  console.log("[DEBUG] ForecastSelector - Should show Generate button:", showGenerateButton);
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-64">
          <Select
            value={selectedForecastId}
            onValueChange={(id) => {
              console.log("[DEBUG] ForecastSelector - Forecast selection changed to:", id);
              onForecastChange(id);
            }}
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
        
        {showGenerateButton && (
          <Button 
            onClick={() => {
              console.log("[DEBUG] ForecastSelector - Generate button clicked");
              onGenerateClick();
            }}
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
