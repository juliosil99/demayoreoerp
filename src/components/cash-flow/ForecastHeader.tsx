
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
  isMobile?: boolean;
}

export function ForecastHeader({
  forecast,
  isGenerating,
  onCreateForecastClick,
  onGenerateForecastClick,
  selectedForecastId,
  isMobile = false
}: ForecastHeaderProps) {
  console.log("[DEBUG] ForecastHeader - Render with props:", {
    forecastId: selectedForecastId,
    forecastStatus: forecast?.status,
    isGenerating
  });
  
  const showGenerateButton = selectedForecastId && forecast?.status !== 'draft';
  console.log("[DEBUG] ForecastHeader - Should show Generate button:", showGenerateButton);
  
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className={isMobile ? "text-xl font-bold" : "text-3xl font-bold"}>Pronóstico de Flujo de Efectivo</h1>
        {!isMobile && (
          <p className="text-muted-foreground mt-1">
            Proyección de flujo de efectivo para las próximas 13 semanas
          </p>
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'space-x-3'}`}>
        {showGenerateButton && (
          <Button 
            variant="outline" 
            onClick={() => {
              console.log("[DEBUG] ForecastHeader - Update forecast button clicked");
              onGenerateForecastClick();
            }}
            disabled={isGenerating}
            className={isMobile ? "text-xs px-2 py-1" : ""}
            size={isMobile ? "sm" : "default"}
          >
            <RefreshCw className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
            {isMobile ? "Actualizar" : "Actualizar Pronóstico"}
          </Button>
        )}
        
        <Button 
          onClick={() => {
            console.log("[DEBUG] ForecastHeader - New forecast button clicked");
            onCreateForecastClick();
          }}
          className={isMobile ? "text-xs px-2 py-1" : ""}
          size={isMobile ? "sm" : "default"}
        >
          <Plus className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
          {isMobile ? "Nuevo" : "Nuevo Pronóstico"}
        </Button>
      </div>
    </div>
  );
}
