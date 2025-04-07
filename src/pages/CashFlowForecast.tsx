
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, PlusCircle, Database, LineChart } from "lucide-react";
import { toast } from "sonner";
import { useCashFlowForecast } from "@/hooks/cash-flow/useCashFlowForecast";
import { useCashFlowForecasts } from "@/hooks/cash-flow/useCashFlowForecasts";
import { useHistoricalData } from "@/hooks/cash-flow/useHistoricalData";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";
import { WeeklyForecastTable } from "@/components/cash-flow/WeeklyForecastTable";
import { AIInsightCard } from "@/components/cash-flow/AIInsightCard";
import { ForecastItemsCard } from "@/components/cash-flow/ForecastItemsCard";
import { ForecastSummaryCards } from "@/components/cash-flow/ForecastSummaryCards";
import { CreateForecastDialog } from "@/components/cash-flow/CreateForecastDialog";
import { GenerateForecastDialog } from "@/components/cash-flow/GenerateForecastDialog";
import { ForecastItemDialog } from "@/components/cash-flow/ForecastItemDialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const CashFlowForecast = () => {
  const [selectedForecastId, setSelectedForecastId] = useState<string | undefined>();
  const [selectedWeek, setSelectedWeek] = useState<ForecastWeek | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ForecastItem | undefined>();
  const [isOpenAIDialogOpen, setIsOpenAIDialogOpen] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  
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
      
      // Update forecast status
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
  
  const handleSaveOpenAIKey = async () => {
    if (!openaiApiKey.trim()) {
      toast.error('Por favor ingrese una clave API válida');
      return;
    }
    
    setIsSavingApiKey(true);
    
    try {
      // Save the API key to Supabase edge function secrets
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          key: 'OPENAI_API_KEY',
          value: openaiApiKey
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar la clave API');
      }
      
      toast.success('Clave API guardada correctamente');
      setIsOpenAIDialogOpen(false);
      setOpenaiApiKey("");
      
      // If we have a selected forecast with insights, try regenerating the forecast
      if (selectedForecastId && forecast) {
        await generateAIForecast(historicalData, {});
        toast.success('Análisis de IA actualizado');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Error al guardar la clave API');
    } finally {
      setIsSavingApiKey(false);
    }
  };
  
  const historicalDataCount = {
    payables: historicalData.payables.length,
    receivables: historicalData.receivables.length,
    expenses: historicalData.expenses.length,
    sales: historicalData.sales.length,
    bankAccounts: historicalData.bankAccounts.length
  };
  
  const isDataLoading = isLoading || isLoadingForecasts || isLoadingHistoricalData;

  return (
    <div className="container p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pronóstico de Flujo de Efectivo</h1>
          <p className="text-muted-foreground mt-1">
            Proyección de flujo de efectivo para las próximas 13 semanas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedForecastId && forecast?.status !== 'draft' && (
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateDialogOpen(true)}
              disabled={isGenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Pronóstico
            </Button>
          )}
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pronóstico
          </Button>
        </div>
      </div>
      
      {(forecasts?.length > 0 || isLoadingForecasts) && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-64">
              <Select
                value={selectedForecastId}
                onValueChange={handleForecastChange}
                disabled={isDataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un pronóstico" />
                </SelectTrigger>
                <SelectContent>
                  {forecasts?.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedForecastId && forecast?.status === 'draft' && (
              <Button 
                onClick={() => setIsGenerateDialogOpen(true)}
                disabled={isGenerating}
              >
                <LineChart className="mr-2 h-4 w-4" />
                Generar Pronóstico
              </Button>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            {forecast && (
              <span>
                Creado: {new Date(forecast.created_at).toLocaleDateString("es-MX")}
              </span>
            )}
          </div>
        </div>
      )}
      
      {selectedForecastId && weeks && weeks.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            <ForecastSummaryCards weeks={weeks} />
          </div>
          
          <CashFlowChart weeks={weeks} />
          
          <div className="grid grid-cols-3 gap-6">
            <WeeklyForecastTable 
              weeks={weeks} 
              onSelectWeek={handleSelectWeek}
              selectedWeekId={selectedWeek?.id}
            />
            
            <ForecastItemsCard 
              selectedWeek={selectedWeek} 
              items={items || []}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
            />
            
            <AIInsightCard 
              insights={forecast?.ai_insights || ''}
              isLoading={isGenerating}
              onRequestAPIKey={handleOpenAISetup}
            />
          </div>
        </>
      ) : (
        <div className="mt-20 text-center">
          {isDataLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Cargando datos...</p>
            </div>
          ) : forecasts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <LineChart className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No hay pronósticos</h2>
              <p className="text-muted-foreground mb-6">
                Cree un nuevo pronóstico para comenzar a planificar su flujo de efectivo
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Pronóstico
              </Button>
            </div>
          ) : selectedForecastId && (!weeks || weeks.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Database className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pronóstico sin datos</h2>
              <p className="text-muted-foreground mb-6">
                Genere el pronóstico para ver proyecciones de flujo de efectivo
              </p>
              <Button 
                onClick={() => setIsGenerateDialogOpen(true)}
                disabled={isGenerating}
              >
                <LineChart className="mr-2 h-4 w-4" />
                Generar Pronóstico
              </Button>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Dialogs */}
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
      
      {/* OpenAI API Key Dialog */}
      <Dialog open={isOpenAIDialogOpen} onOpenChange={setIsOpenAIDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurar API Key de OpenAI</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key de OpenAI</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                La clave API se guardará de forma segura en los secretos de la función edge.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenAIDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOpenAIKey} disabled={isSavingApiKey}>
              {isSavingApiKey ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashFlowForecast;
