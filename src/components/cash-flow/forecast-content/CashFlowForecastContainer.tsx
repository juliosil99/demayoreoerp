
import React from "react";
import { ForecastPageContainer } from "@/components/cash-flow/ForecastPageContainer";
import { ForecastDialogs } from "@/components/cash-flow/ForecastDialogs";
import { useCashFlowContent } from "./useCashFlowContent";

export const CashFlowForecastContainer = () => {
  const {
    forecast,
    forecasts,
    weeks,
    items,
    selectedForecastId,
    selectedWeek,
    isCreateDialogOpen,
    isGenerateDialogOpen,
    isItemDialogOpen,
    isOpenAIDialogOpen,
    editingItem,
    historicalDataCount,
    isDataLoading,
    isLoadingForecasts,
    isGenerating,
    
    handleForecastChange,
    onCreateForecast,
    onGenerateForecast,
    onSaveItem,
    onSaveOpenAIKey,
    onAddItem,
    onEditItem,
    handleSelectWeek,
    openCreateDialog,
    openGenerateDialog,
    closeCreateDialog,
    closeGenerateDialog,
    closeItemDialog,
    closeOpenAIDialog,
    openOpenAIDialog
  } = useCashFlowContent();

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
        isCreating={false}
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
