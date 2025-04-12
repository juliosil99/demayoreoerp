
import { useForecastData, useForecastHandlers, useForecastViewState } from "@/hooks/cash-flow/content";
import { ForecastItem } from "@/types/cashFlow";

export function useCashFlowContent() {
  // Get data and selection state
  const {
    forecast,
    forecasts,
    weeks,
    items,
    selectedForecastId,
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
    upsertItem,
    setSelectedForecastId
  } = useForecastData();
  
  // Get UI state management
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
    handleSelectWeek,
    onAddItem,
    onEditItem
  } = useForecastViewState();
  
  // Get event handlers
  const {
    onCreateForecast,
    onGenerateForecast,
    onSaveItem,
    onSaveOpenAIKey
  } = useForecastHandlers({
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
  
  // Refactored version of onCreateForecast that also closes the dialog
  const handleCreateForecast = async (name: string, startDate: Date) => {
    const result = await onCreateForecast(name, startDate);
    if (result.success) {
      closeCreateDialog();
    }
    return result;
  };
  
  // Refactored version of onGenerateForecast that also closes the dialog
  const handleGenerateForecast = async (options: Record<string, any>) => {
    const success = await onGenerateForecast(options);
    if (success) {
      closeGenerateDialog();
    }
    return success;
  };
  
  // Refactored version of onSaveItem that also closes the dialog
  const handleSaveItem = async (item: Partial<ForecastItem>) => {
    const success = await onSaveItem(item);
    if (success) {
      closeItemDialog();
    }
    return success;
  };
  
  // Refactored version of onSaveOpenAIKey that also closes the dialog
  const handleSaveOpenAIKey = async (apiKey: string) => {
    const success = await onSaveOpenAIKey(apiKey);
    if (success) {
      closeOpenAIDialog();
    }
    return success;
  };
  
  return {
    // Data
    forecast,
    forecasts,
    weeks,
    items,
    selectedForecastId,
    selectedWeek,
    isDataLoading,
    isLoadingForecasts,
    isGenerating,
    editingItem,
    historicalDataCount,
    
    // States
    isCreateDialogOpen,
    isGenerateDialogOpen,
    isItemDialogOpen,
    isOpenAIDialogOpen,
    
    // Actions
    handleForecastChange,
    onCreateForecast: handleCreateForecast,
    onGenerateForecast: handleGenerateForecast,
    onSaveItem: handleSaveItem,
    onSaveOpenAIKey: handleSaveOpenAIKey,
    onAddItem,
    onEditItem,
    handleSelectWeek,
    
    // Dialog actions
    openCreateDialog,
    closeCreateDialog,
    openGenerateDialog,
    closeGenerateDialog,
    closeItemDialog,
    closeOpenAIDialog,
    openOpenAIDialog
  };
}
