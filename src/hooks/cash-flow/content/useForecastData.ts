
import { useForecastSelection } from "@/hooks/cash-flow/useForecastSelection";
import { useCashFlowForecasts } from "@/hooks/cash-flow/useCashFlowForecasts";
import { useCashFlowForecast } from "@/hooks/cash-flow/useCashFlowForecast";
import { useHistoricalData } from "@/hooks/cash-flow/useHistoricalData";
import { useEffect } from "react";

export function useForecastData() {
  const { 
    selectedForecastId, 
    setSelectedForecastId, 
    handleForecastChange 
  } = useForecastSelection();
  
  console.log("[DEBUG] CashFlowForecast - selectedForecastId:", selectedForecastId);
  
  const { 
    forecasts, 
    isLoading: isLoadingForecasts,
    createForecast: createForecastMutation,
    refetch: refetchForecasts
  } = useCashFlowForecasts();
  
  console.log("[DEBUG] CashFlowForecast - forecasts:", forecasts);
  
  const { 
    forecast, 
    weeks, 
    items,
    isLoading,
    isGenerating,
    generateAIForecast,
    upsertItem,
    updateForecast,
    refreshAllForecastData,
    SUPABASE_URL
  } = useCashFlowForecast(selectedForecastId);
  
  console.log("[DEBUG] CashFlowForecast - forecast data:", { 
    forecast, 
    weeksCount: weeks?.length,
    itemsCount: items?.length,
    isLoading,
    isGenerating,
    status: forecast?.status
  });
  
  const { 
    historicalData, 
    isLoading: isLoadingHistoricalData 
  } = useHistoricalData();
  
  console.log("[DEBUG] CashFlowForecast - historicalData counts:", {
    payablesCount: historicalData?.payables?.length,
    receivablesCount: historicalData?.receivables?.length,
    expensesCount: historicalData?.expenses?.length,
    salesCount: historicalData?.sales?.length,
    bankAccountsCount: historicalData?.bankAccounts?.length
  });
  
  useEffect(() => {
    if (selectedForecastId) {
      console.log("[DEBUG] CashFlowForecast - Refreshing data for forecast:", selectedForecastId);
      refreshAllForecastData();
    }
  }, [selectedForecastId, refreshAllForecastData]);
  
  const historicalDataCount = {
    payables: historicalData.payables.length,
    receivables: historicalData.receivables.length,
    expenses: historicalData.expenses.length,
    sales: historicalData.sales.length,
    bankAccounts: historicalData.bankAccounts.length,
    availableCashBalance: historicalData.availableCashBalance,
    creditLiabilities: historicalData.creditLiabilities,
    netPosition: historicalData.netPosition
  };
  
  const isDataLoading = isLoading || isLoadingForecasts || isLoadingHistoricalData;
  
  return {
    forecast,
    forecasts,
    weeks,
    items,
    selectedForecastId,
    setSelectedForecastId,
    handleForecastChange,
    historicalData,
    historicalDataCount,
    isDataLoading,
    isLoadingForecasts,
    isGenerating,
    generateAIForecast,
    refreshAllForecastData,
    SUPABASE_URL,
    createForecastMutation,
    refetchForecasts,
    updateForecast,
    upsertItem
  };
}
