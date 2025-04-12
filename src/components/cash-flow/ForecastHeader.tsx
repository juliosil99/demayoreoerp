
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { CashFlowForecast } from "@/types/cashFlow";
import { differenceInDays, parseISO } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Determine if the forecast needs to be updated
  const needsUpdate = React.useMemo(() => {
    if (!forecast || !forecast.last_reconciled_date) return true;
    
    const lastReconciled = parseISO(forecast.last_reconciled_date);
    const today = new Date();
    const daysSinceUpdate = differenceInDays(today, lastReconciled);
    
    // If it's been more than 3 days since the last update
    return daysSinceUpdate > 3;
  }, [forecast]);
  
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className={isMobile ? "text-xl font-bold" : "text-3xl font-bold"}>Pronóstico de Flujo de Efectivo</h1>
        {!isMobile && (
          <p className="text-muted-foreground mt-1">
            Proyección continua de flujo de efectivo para las próximas 13 semanas
          </p>
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'space-x-3'}`}>
        {selectedForecastId && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={needsUpdate ? "default" : "outline"} 
                  onClick={() => {
                    console.log("[DEBUG] ForecastHeader - Update forecast button clicked");
                    onGenerateForecastClick();
                  }}
                  disabled={isGenerating}
                  className={`${isMobile ? "text-xs px-2 py-1" : ""} ${needsUpdate ? "animate-pulse" : ""}`}
                  size={isMobile ? "sm" : "default"}
                >
                  {needsUpdate && <AlertCircle className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />}
                  {!needsUpdate && <RefreshCw className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />}
                  {isMobile ? "Actualizar" : "Actualizar Pronóstico"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {needsUpdate 
                  ? "Se recomienda actualizar el pronóstico con los saldos actuales" 
                  : "Actualizar pronóstico con datos recientes"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {!selectedForecastId && (
          <Button 
            onClick={() => {
              console.log("[DEBUG] ForecastHeader - New forecast button clicked");
              onCreateForecastClick();
            }}
            className={isMobile ? "text-xs px-2 py-1" : ""}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
            {isMobile ? "Crear" : "Crear Pronóstico"}
          </Button>
        )}
      </div>
    </div>
  );
}
