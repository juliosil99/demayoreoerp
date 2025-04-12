
import { useState } from "react";
import { ForecastHistoricalData } from "@/types/cashFlow";
import { toast } from "sonner";

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
        startWithCurrentBalance: true
      };
      
      const effectiveOptions = options || defaultConfig;

      // For debugging
      console.log("[DEBUG - Balance Tracking] Generating forecast with data:", { 
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
        },
        options: effectiveOptions,
        startWithCurrentBalance: effectiveOptions.startWithCurrentBalance
      });

      // Fix the API endpoint URL - use the correct Supabase function URL
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
