
import React, { useState } from "react";
import { toast } from "sonner";
import { useCashFlowForecast } from "@/hooks/cash-flow/useCashFlowForecast";
import { useCashFlowForecasts } from "@/hooks/cash-flow/useCashFlowForecasts";
import { useHistoricalData } from "@/hooks/cash-flow/useHistoricalData";
import { ForecastHeader } from "@/components/cash-flow/ForecastHeader";
import { ForecastSelector } from "@/components/cash-flow/ForecastSelector";
import { EmptyForecastState } from "@/components/cash-flow/EmptyForecastState";
import { ForecastContent } from "@/components/cash-flow/ForecastContent";
import { CreateForecastDialog } from "@/components/cash-flow/CreateForecastDialog";
import { GenerateForecastDialog } from "@/components/cash-flow/GenerateForecastDialog";
import { ForecastItemDialog } from "@/components/cash-flow/ForecastItemDialog";
import { OpenAIKeyDialog } from "@/components/cash-flow/OpenAIKeyDialog";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";

const CashFlowForecast = () => {
  const [selectedForecastId, setSelectedForecastId] = useState<string | undefined>();
  const [selectedWeek, setSelectedWeek] = useState<ForecastWeek | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ForecastItem | undefined>();
  const [isOpenAIDialogOpen, setIsOpenAIDialogOpen] = useState(false);
  
  const { 
    forecasts, 
    isLoading: isLoadingForecasts,
    createForecast: createForecastMutation
  } = useCashFlowForecasts();
  
  const { 
    forecast, 
    weeks, 
    items,
    isLoading,
    isGenerating,
    generateAIForecast,
    upsertItem,
    updateForecast
  } = useCashFlowForecast(selectedForecastId);
  
  const { 
    historicalData, 
    isLoading: isLoadingHistoricalData 
  } = useHistoricalData();
  
  const handleCreateForecast = async (name: string, startDate: Date) => {
    try {
      const result = await createForecastMutation.mutateAsync({
        name,
        start_date: startDate.toISOString().split('T')[0],
        status: 'draft'
      });
      
      setSelectedForecastId(result.id);
      setIsCreateDialogOpen(false);
      toast.success('Pronóstico creado correctamente');
    } catch (error) {
      console.error('Error creating forecast:', error);
      toast.error('Error al crear el pronóstico');
    }
  };
  
  const handleGenerateForecast = async (options: Record<string, any>) => {
    if (!selectedForecastId) return;
    
    try {
      await generateAIForecast(historicalData, options);
      
      await updateForecast.mutateAsync({
        status: 'active'
      });
      
      setIsGenerateDialogOpen(false);
      toast.success('Pronóstico generado correctamente');
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast.error('Error al generar el pronóstico');
    }
  };
  
  const handleSelectWeek = (week: ForecastWeek) => {
    setSelectedWeek(week);
  };
  
  const handleAddItem = () => {
    setEditingItem(undefined);
    setIsItemDialogOpen(true);
  };
  
  const handleEditItem = (item: ForecastItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };
  
  const handleSaveItem = async (item: Partial<ForecastItem>) => {
    try {
      await upsertItem.mutateAsync(item);
      setIsItemDialogOpen(false);
      toast.success('Elemento guardado correctamente');
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error al guardar el elemento');
    }
  };
  
  const handleForecastChange = (forecastId: string) => {
    setSelectedForecastId(forecastId);
    setSelectedWeek(undefined);
  };
  
  const handleOpenAISetup = () => {
    setIsOpenAIDialogOpen(true);
  };
  
  const historicalDataCount = {
    payables: historicalData.payables.length,
    receivables: historicalData.receivables.length,
    expenses: historicalData.expenses.length,
    sales: historicalData.sales.length,
    bankAccounts: historicalData.bankAccounts.length
  };
  
  const isDataLoading = isLoading || isLoadingForecasts || isLoadingHistoricalData;
  const hasWeeks = weeks && weeks.length > 0;

  return (
    <div className="container p-6 space-y-6">
      <ForecastHeader 
        forecast={forecast}
        isGenerating={isGenerating}
        onCreateForecastClick={() => setIsCreateDialogOpen(true)}
        onGenerateForecastClick={() => setIsGenerateDialogOpen(true)}
        selectedForecastId={selectedForecastId}
      />
      
      {(forecasts?.length > 0 || isLoadingForecasts) && (
        <ForecastSelector 
          forecasts={forecasts}
          selectedForecastId={selectedForecastId}
          forecast={forecast}
          isLoading={isDataLoading}
          isGenerating={isGenerating}
          onForecastChange={handleForecastChange}
          onGenerateClick={() => setIsGenerateDialogOpen(true)}
        />
      )}
      
      {selectedForecastId && hasWeeks ? (
        <ForecastContent 
          weeks={weeks}
          items={items || []}
          selectedWeek={selectedWeek}
          insights={forecast?.ai_insights}
          isGenerating={isGenerating}
          onSelectWeek={handleSelectWeek}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onRequestAPIKey={handleOpenAISetup}
        />
      ) : (
        <div className="mt-20 text-center">
          <EmptyForecastState 
            isLoading={isDataLoading}
            forecastsCount={forecasts?.length || 0}
            selectedForecastId={selectedForecastId}
            hasWeeks={hasWeeks}
            onCreateClick={() => setIsCreateDialogOpen(true)}
            onConfigureAPIKeyClick={handleOpenAISetup}
            onGenerateClick={() => setIsGenerateDialogOpen(true)}
            isGenerating={isGenerating}
          />
        </div>
      )}
      
      <CreateForecastDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateForecast={handleCreateForecast}
        isCreating={createForecastMutation.isPending}
      />
      
      <GenerateForecastDialog 
        isOpen={isGenerateDialogOpen}
        onClose={() => setIsGenerateDialogOpen(false)}
        onGenerate={handleGenerateForecast}
        isLoading={isGenerating}
        historicalDataCount={historicalDataCount}
      />
      
      <ForecastItemDialog 
        isOpen={isItemDialogOpen}
        onClose={() => setIsItemDialogOpen(false)}
        onSave={handleSaveItem}
        selectedWeek={selectedWeek}
        item={editingItem}
      />
      
      <OpenAIKeyDialog 
        isOpen={isOpenAIDialogOpen}
        onClose={() => setIsOpenAIDialogOpen(false)}
      />
    </div>
  );
};

export default CashFlowForecast;
