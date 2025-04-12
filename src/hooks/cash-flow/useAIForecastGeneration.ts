
import { useState } from "react";
import { ForecastHistoricalData } from "@/types/cashFlow";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function useAIForecastGeneration(
  forecastId?: string,
  onForecastGenerated?: () => void
) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIForecast = async (historicalData: ForecastHistoricalData, options?: Record<string, any>) => {
    if (!forecastId) {
      toast.error("No se ha seleccionado un pronóstico.");
      return false;
    }

    try {
      setIsGenerating(true);
      
      const defaultConfig = {
        useAI: true,
        includeHistoricalTrends: true,
        includeSeasonality: true,
        includePendingPayables: true,
        includeRecurringExpenses: true,
        includeCreditPayments: true,
        startWithCurrentBalance: true,
        useRollingForecast: true, // New option for rolling forecast
        forecastHorizonWeeks: 13 // Default to 13 weeks
      };
      
      const effectiveOptions = options || defaultConfig;

      // For debugging
      console.log("[DEBUG - Rolling Forecast] Generating forecast with data:", { 
        forecastId,
        historicalDataCounts: {
          payables: historicalData.payables?.length,
          receivables: historicalData.receivables?.length,
          expenses: historicalData.expenses?.length,
          sales: historicalData.sales?.length,
          bankAccounts: historicalData.bankAccounts?.length,
          availableCashBalance: historicalData.availableCashBalance,
          creditLiabilities: historicalData.creditLiabilities,
          netPosition: historicalData.netPosition,
          balanceHistoryEntries: historicalData.balance_history?.length
        },
        options: effectiveOptions,
        startWithCurrentBalance: effectiveOptions.startWithCurrentBalance,
        useRollingForecast: effectiveOptions.useRollingForecast
      });

      // Try to use Supabase Edge Function directly
      const { data: functionData, error: functionError } = await supabase.functions.invoke('cash-flow-forecast', {
        body: {
          forecastId,
          historicalData,
          config: effectiveOptions
        }
      });
      
      if (functionError) {
        console.error("[DEBUG - API Error] Function error:", functionError);
        
        // Fall back to using the REST endpoint if function invoke fails
        try {
          const response = await fetch("/functions/v1/cash-flow-forecast", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              forecastId,
              historicalData,
              config: effectiveOptions
            }),
          });
    
          if (!response.ok) {
            const errorText = await response.text();
            console.error("[DEBUG - API Error]", {
              status: response.status,
              statusText: response.statusText,
              errorText
            });
            throw new Error(`API error: ${response.status} ${errorText || response.statusText}`);
          }
    
          const result = await response.json();
    
          if (!result.success) {
            throw new Error(result.error || "Error generating forecast");
          }
          
          toast.success("Pronóstico generado con éxito.");
          
          if (onForecastGenerated) {
            onForecastGenerated();
          }
          
          return true;
        } catch (fetchError) {
          console.error("[ERROR] Fetch fallback failed:", fetchError);
          throw fetchError;
        }
      }
      
      if (!functionData.success) {
        throw new Error(functionData.error || "Error generating forecast");
      }

      toast.success("Pronóstico generado con éxito.");
      
      if (onForecastGenerated) {
        onForecastGenerated();
      }
      
      return true;
    } catch (error) {
      console.error("[ERROR] Failed to generate AI forecast:", error);
      toast.error("Error al generar el pronóstico: " + (error as Error).message);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateAIForecast
  };
}
