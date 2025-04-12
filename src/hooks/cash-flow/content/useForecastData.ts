
import { useForecastSelection } from "@/hooks/cash-flow/useForecastSelection";
import { useCashFlowForecasts } from "@/hooks/cash-flow/useCashFlowForecasts";
import { useCashFlowForecast } from "@/hooks/cash-flow/useCashFlowForecast";
import { useHistoricalData } from "@/hooks/cash-flow/useHistoricalData";
import { useEffect, useState } from "react";

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
  
  // Auto-select the first forecast if none is selected (for rolling forecast)
  useEffect(() => {
    if (!selectedForecastId && forecasts && forecasts.length > 0) {
      setSelectedForecastId(forecasts[0].id);
    }
  }, [forecasts, selectedForecastId, setSelectedForecastId]);
  
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
    status: forecast?.status,
    initialBalance: forecast?.initial_balance,
    availableCashBalance: forecast?.available_cash_balance
  });
  
  const { 
    historicalData, 
    isLoading: isLoadingHistoricalData 
  } = useHistoricalData();
  
  console.log("[DEBUG - Balance Tracking] useForecastData - historicalData balances:", {
    availableCashBalance: historicalData?.availableCashBalance,
    creditLiabilities: historicalData?.creditLiabilities,
    netPosition: historicalData?.netPosition
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
