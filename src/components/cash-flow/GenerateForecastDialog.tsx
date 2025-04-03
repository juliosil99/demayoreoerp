
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CircleCheck, CircleAlert, Brain, BarChart, Banknote, Calendar, SparklesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GenerateForecastDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: Record<string, any>) => void;
  isLoading: boolean;
  historicalDataCount: {
    payables: number;
    receivables: number;
    expenses: number;
    sales: number;
    bankAccounts: number;
  };
}

export function GenerateForecastDialog({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  historicalDataCount
}: GenerateForecastDialogProps) {
  const [options, setOptions] = useState({
    useAI: true,
    includeHistoricalTrends: true,
    includeSeasonality: true,
    includePendingPayables: true,
    includeRecurringExpenses: true,
  });

  const handleOptionChange = (option: string, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleGenerate = () => {
    onGenerate(options);
  };
  
  // Determine if we have enough data
  const hasEnoughData = 
    historicalDataCount.bankAccounts > 0 && 
    (historicalDataCount.payables > 0 || 
     historicalDataCount.receivables > 0 || 
     historicalDataCount.expenses > 0 || 
     historicalDataCount.sales > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Generar Pronóstico con IA</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Fuentes de Datos</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <Card className={`p-3 ${historicalDataCount.bankAccounts > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <CardContent className="p-0 flex flex-col items-center">
                  <Banknote className={`h-8 w-8 mb-1 ${historicalDataCount.bankAccounts > 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-xs font-medium">{historicalDataCount.bankAccounts} Cuentas</span>
                </CardContent>
              </Card>
              
              <Card className={`p-3 ${historicalDataCount.payables > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <CardContent className="p-0 flex flex-col items-center">
                  <Calendar className={`h-8 w-8 mb-1 ${historicalDataCount.payables > 0 ? 'text-green-500' : 'text-amber-500'}`} />
                  <span className="text-xs font-medium">{historicalDataCount.payables} Pagos</span>
                </CardContent>
              </Card>
              
              <Card className={`p-3 ${historicalDataCount.expenses > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <CardContent className="p-0 flex flex-col items-center">
                  <BarChart className={`h-8 w-8 mb-1 ${historicalDataCount.expenses > 0 ? 'text-green-500' : 'text-amber-500'}`} />
                  <span className="text-xs font-medium">{historicalDataCount.expenses} Gastos</span>
                </CardContent>
              </Card>
            </div>
            
            {!hasEnoughData && (
              <div className="flex items-center mt-2 text-amber-500 text-sm">
                <CircleAlert className="h-4 w-4 mr-2" />
                Datos limitados. El pronóstico puede ser menos preciso.
              </div>
            )}

            {hasEnoughData && (
              <div className="flex items-center mt-2 text-green-500 text-sm">
                <CircleCheck className="h-4 w-4 mr-2" />
                Datos suficientes para un pronóstico razonable.
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Opciones de Pronóstico</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <Label htmlFor="useAI" className="text-sm">Usar Inteligencia Artificial</Label>
                </div>
                <Switch
                  id="useAI"
                  checked={options.useAI}
                  onCheckedChange={(checked) => handleOptionChange('useAI', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-blue-500" />
                  <Label htmlFor="includeHistoricalTrends" className="text-sm">Incluir Tendencias Históricas</Label>
                </div>
                <Switch
                  id="includeHistoricalTrends"
                  checked={options.includeHistoricalTrends}
                  onCheckedChange={(checked) => handleOptionChange('includeHistoricalTrends', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-amber-500" />
                  <Label htmlFor="includeSeasonality" className="text-sm">Considerar Estacionalidad</Label>
                </div>
                <Switch
                  id="includeSeasonality"
                  checked={options.includeSeasonality}
                  onCheckedChange={(checked) => handleOptionChange('includeSeasonality', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <Label htmlFor="includePendingPayables" className="text-sm">Incluir Cuentas Pendientes</Label>
                </div>
                <Switch
                  id="includePendingPayables"
                  checked={options.includePendingPayables}
                  onCheckedChange={(checked) => handleOptionChange('includePendingPayables', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-5 w-5 text-red-500" />
                  <Label htmlFor="includeRecurringExpenses" className="text-sm">Incluir Gastos Recurrentes</Label>
                </div>
                <Switch
                  id="includeRecurringExpenses"
                  checked={options.includeRecurringExpenses}
                  onCheckedChange={(checked) => handleOptionChange('includeRecurringExpenses', checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLoading ? 'Generando...' : 'Generar Pronóstico'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
