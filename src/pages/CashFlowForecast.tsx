
import React, { useEffect } from "react";
import { useCashFlowForecast } from "@/hooks/cash-flow/useCashFlowForecast";
import { useCashFlowForecasts } from "@/hooks/cash-flow/useCashFlowForecasts";
import { useHistoricalData } from "@/hooks/cash-flow/useHistoricalData";
import { useDialogState } from "@/hooks/cash-flow/useDialogState";
import { useForecastSelection } from "@/hooks/cash-flow/useForecastSelection";
import { useForecastOperations } from "@/hooks/cash-flow/useForecastOperations";
import { ForecastPageContainer } from "@/components/cash-flow/ForecastPageContainer";
import { ForecastDialogs } from "@/components/cash-flow/ForecastDialogs";

const CashFlowForecast = () => {
  const { 
    selectedForecastId, 
    setSelectedForecastId, 
    handleForecastChange 
  } = useForecastSelection();
  
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
  
  const { 
    forecasts, 
    isLoading: isLoadingForecasts,
    createForecast: createForecastMutation,
    refetch: refetchForecasts
  } = useCashFlowForecasts();
  
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
  
  const { 
    historicalData, 
    isLoading: isLoadingHistoricalData 
  } = useHistoricalData();
  
  const {
    handleCreateForecast,
    handleGenerateForecast,
    handleSaveItem,
    handleSaveOpenAIKey
  } = useForecastOperations(selectedForecastId, refreshAllForecastData, SUPABASE_URL);
  
  useEffect(() => {
    if (selectedForecastId) {
      refreshAllForecastData();
    }
  }, [selectedForecastId, refreshAllForecastData]);
  
  // Handlers
  const onCreateForecast = async (name: string, startDate: Date) => {
    try {
      const result = await handleCreateForecast(
        createForecastMutation, 
        refetchForecasts, 
        setSelectedForecastId,
        name, 
        startDate
      );
      closeCreateDialog();
    } catch (error) {
      // Error already handled in the hook
    }
  };
  
  const onGenerateForecast = async (options: Record<string, any>) => {
    await handleGenerateForecast(generateAIForecast, updateForecast, historicalData, options);
    closeGenerateDialog();
  };
  
  const onSaveItem = async (item: Partial<ForecastItem>) => {
    const success = await handleSaveItem(upsertItem, item);
    if (success) {
      closeItemDialog();
    }
  };
  
  const onSaveOpenAIKey = async (apiKey: string) => {
    const success = await handleSaveOpenAIKey(apiKey);
    if (success) {
      closeOpenAIDialog();
      if (selectedForecastId) {
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
    bankAccounts: historicalData.bankAccounts.length
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

export default CashFlowForecast;
