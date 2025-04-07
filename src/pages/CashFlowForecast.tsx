import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, PlusCircle, Database, LineChart, Key } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
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
    setOpenaiApiKey("");
    setApiKeyError(null);
    setIsOpenAIDialogOpen(true);
  };
  
  const validateApiKey = (key: string) => {
    if (!key.trim()) {
      setApiKeyError("La clave API es requerida");
      return false;
    }
    
    if (!key.startsWith("sk-")) {
      setApiKeyError("La clave API de OpenAI debe comenzar con 'sk-'");
      return false;
    }
    
    setApiKeyError(null);
    return true;
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
    if (apiKeyError) {
      validateApiKey(e.target.value);
    }
  };
  
  const handleSaveOpenAIKey = async () => {
    if (!validateApiKey(openaiApiKey)) {
      return;
    }
    
    setIsSavingApiKey(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay una sesión activa');
      }
      
      const supabaseUrl = "https://dulmmxtkgqkcfovvfxzu.supabase.co";
      console.log("Using Supabase URL:", supabaseUrl);
      
      console.log("Calling edge function at:", `${supabaseUrl}/functions/v1/set-api-key`);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/set-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          key: 'OPENAI_API_KEY',
          value: openaiApiKey
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const responseBody = await response.text();
        console.error('Error response:', response.status);
        console.error('Response body:', responseBody);
        
        let errorMessage = 'Error al guardar la clave API';
        try {
          const errorJson = JSON.parse(responseBody);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      toast.success('Clave API guardada correctamente');
      setIsOpenAIDialogOpen(false);
      setOpenaiApiKey("");
      setApiKeyError(null);
      
      if (selectedForecastId && forecast) {
        await generateAIForecast(historicalData, {});
        toast.success('Análisis de IA actualizado');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la clave API');
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
              <div className="flex flex-col space-y-4 items-center">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Pronóstico
                </Button>
                
                <Button
                  onClick={handleOpenAISetup}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Configurar API Key de OpenAI
                </Button>
              </div>
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
              <div className="flex flex-col space-y-4 items-center">
                <Button 
                  onClick={() => setIsGenerateDialogOpen(true)}
                  disabled={isGenerating}
                >
                  <LineChart className="mr-2 h-4 w-4" />
                  Generar Pronóstico
                </Button>
                
                <Button
                  onClick={handleOpenAISetup}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Configurar API Key de OpenAI
                </Button>
              </div>
            </div>
          ) : null}
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
      
      <Dialog open={isOpenAIDialogOpen} onOpenChange={setIsOpenAIDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurar API Key de OpenAI</DialogTitle>
            <DialogDescription>
              Ingrese su clave API de OpenAI para habilitar el análisis de IA en sus pronósticos de flujo de efectivo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key de OpenAI</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={handleApiKeyChange}
                className={apiKeyError ? "border-red-500" : ""}
              />
              {apiKeyError ? (
                <p className="text-xs text-red-500">{apiKeyError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  La clave API debe comenzar con "sk-". Se guardará de forma segura en la base de datos.
                </p>
              )}
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
