
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

      // For debugging
      console.log("[DEBUG] Generating forecast with data:", { 
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
        options
      });

      const response = await fetch("/api/cash-flow-forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forecastId,
          historicalData,
          config: options || {
            useAI: true,
            includeHistoricalTrends: true,
            includeSeasonality: true,
            includePendingPayables: true,
            includeRecurringExpenses: true,
            includeCreditPayments: true,
            startWithCurrentBalance: true
          }
        }),
      });

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
