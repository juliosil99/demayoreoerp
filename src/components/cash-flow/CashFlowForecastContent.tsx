
import React, { useEffect } from "react";
import { useCashFlowForecast } from "@/hooks/cash-flow/useCashFlowForecast";
import { useCashFlowForecasts } from "@/hooks/cash-flow/useCashFlowForecasts";
import { useHistoricalData } from "@/hooks/cash-flow/useHistoricalData";
import { useDialogState } from "@/hooks/cash-flow/useDialogState";
import { useForecastSelection } from "@/hooks/cash-flow/useForecastSelection";
import { ForecastPageContainer } from "@/components/cash-flow/ForecastPageContainer";
import { ForecastDialogs } from "@/components/cash-flow/ForecastDialogs";
import { useForecastEventHandlers } from "@/hooks/cash-flow/useForecastEventHandlers";
import { ForecastItem } from "@/types/cashFlow";

export const CashFlowForecastContent = () => {
  const { 
    selectedForecastId, 
    setSelectedForecastId, 
    handleForecastChange 
  } = useForecastSelection();
  
  console.log("[DEBUG] CashFlowForecast - selectedForecastId:", selectedForecastId);
  
  const {
    isCreateDialogOpen,
    isGenerateDialogOpen,
    isItemDialogOpen,
    isOpenAIDialogOpen,
    editingItem,
    selectedWeek,
    openCreateDialog,
    closeCreateDialog,
    openGenerateDialog,
    closeGenerateDialog,
    openItemDialog,
    closeItemDialog,
    openOpenAIDialog,
    closeOpenAIDialog,
    handleSelectWeek
  } = useDialogState();
  
  console.log("[DEBUG] CashFlowForecast - Dialog States:", { 
    isCreateDialogOpen, 
    isGenerateDialogOpen,
    isItemDialogOpen,
    isOpenAIDialogOpen
  });
  
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

  const {
    handleCreateForecast,
    handleGenerateForecast,
    handleSaveItem,
    handleSaveOpenAIKey
  } = useForecastEventHandlers({
    selectedForecastId,
    refreshAllForecastData,
    SUPABASE_URL,
    createForecastMutation, 
    refetchForecasts,
    setSelectedForecastId,
    generateAIForecast,
    updateForecast,
    upsertItem,
    historicalData
  });
  
  useEffect(() => {
    if (selectedForecastId) {
      console.log("[DEBUG] CashFlowForecast - Refreshing data for forecast:", selectedForecastId);
      refreshAllForecastData();
    }
  }, [selectedForecastId, refreshAllForecastData]);
  
  // Handlers
  const onCreateForecast = async (name: string, startDate: Date) => {
    console.log("[DEBUG] CashFlowForecast - Creating forecast:", { name, startDate });
    try {
      const result = await handleCreateForecast(name, startDate);
      console.log("[DEBUG] CashFlowForecast - Forecast created:", result);
      closeCreateDialog();
    } catch (error) {
      console.error("[DEBUG] CashFlowForecast - Error creating forecast:", error);
    }
  };
  
  const onGenerateForecast = async (options: Record<string, any>) => {
    console.log("[DEBUG] CashFlowForecast - Generating forecast with options:", options);
    await handleGenerateForecast(options);
    console.log("[DEBUG] CashFlowForecast - Forecast generation completed");
    closeGenerateDialog();
  };
  
  const onSaveItem = async (item: Partial<ForecastItem>) => {
    console.log("[DEBUG] CashFlowForecast - Saving item:", item);
    const success = await handleSaveItem(item);
    console.log("[DEBUG] CashFlowForecast - Item saved:", success);
    if (success) {
      closeItemDialog();
    }
  };
  
  const onSaveOpenAIKey = async (apiKey: string) => {
    console.log("[DEBUG] CashFlowForecast - Saving OpenAI key");
    const success = await handleSaveOpenAIKey(apiKey);
    console.log("[DEBUG] CashFlowForecast - OpenAI key saved:", success);
    if (success) {
      closeOpenAIDialog();
      if (selectedForecastId) {
        console.log("[DEBUG] CashFlowForecast - Generating forecast with new API key");
        await generateAIForecast(historicalData);
        await refreshAllForecastData();
      }
    }
  };
  
  const onAddItem = () => openItemDialog();
  const onEditItem = (item: ForecastItem) => openItemDialog(item);
  
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
  
  return (
    <>
      <ForecastPageContainer
        forecast={forecast}
        forecasts={forecasts}
        weeks={weeks}
        items={items}
        selectedForecastId={selectedForecastId}
        selectedWeek={selectedWeek}
        insights={forecast?.ai_insights}
        isLoading={isDataLoading}
        isLoadingForecasts={isLoadingForecasts}
        isGenerating={isGenerating}
        onForecastChange={handleForecastChange}
        onCreateForecastClick={openCreateDialog}
        onGenerateForecastClick={openGenerateDialog}
        onSelectWeek={handleSelectWeek}
        onAddItem={onAddItem}
        onEditItem={onEditItem}
        onRequestAPIKey={openOpenAIDialog}
      />
      
      <ForecastDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        isGenerateDialogOpen={isGenerateDialogOpen}
        isItemDialogOpen={isItemDialogOpen}
        isOpenAIDialogOpen={isOpenAIDialogOpen}
        selectedWeek={selectedWeek}
        editingItem={editingItem}
        historicalDataCount={historicalDataCount}
        isCreating={createForecastMutation.isPending}
        isGenerating={isGenerating}
        onCloseCreateDialog={closeCreateDialog}
        onCloseGenerateDialog={closeGenerateDialog}
        onCloseItemDialog={closeItemDialog}
        onCloseOpenAIDialog={closeOpenAIDialog}
        onCreateForecast={onCreateForecast}
        onGenerateForecast={onGenerateForecast}
        onSaveItem={onSaveItem}
        onSaveOpenAIKey={onSaveOpenAIKey}
      />
    </>
  );
};
