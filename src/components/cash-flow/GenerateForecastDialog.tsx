
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { DataSourcesPanel } from "./forecast-generation/DataSourcesPanel";
import { ForecastOptionsPanel } from "./forecast-generation/ForecastOptionsPanel";
import { ForecastDataCount, ForecastOptions } from "./forecast-generation/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO, differenceInDays } from "date-fns";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { CashFlowForecast } from "@/types/cashFlow";

interface GenerateForecastDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  forecast?: CashFlowForecast | null;
  historicalDataCount: ForecastDataCount;
  onClose: () => void;
  onGenerate: (options: Record<string, any>) => void;
}

export function GenerateForecastDialog({
  isOpen,
  isLoading,
  forecast,
  historicalDataCount,
  onClose,
  onGenerate
}: GenerateForecastDialogProps) {
  console.log("[DEBUG] GenerateForecastDialog - Render with props:", {
    isOpen,
    isLoading,
    historicalDataCount,
    forecast
  });
  
  const isMobile = useIsMobile();
  
  // State for forecast options
  const [options, setOptions] = React.useState<ForecastOptions>({
    useAI: true,
    includeHistoricalTrends: true,
    includeSeasonality: true,
    includePendingPayables: true,
    includeRecurringExpenses: true,
    includeCreditPayments: true,
    startWithCurrentBalance: true
  });
  
  // State for reconciliation
  const [reconcileBalances, setReconcileBalances] = React.useState(false);
  
  // Function to handle option changes
  const handleOptionChange = <K extends keyof ForecastOptions>(option: K, value: ForecastOptions[K]) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Determine if balances are out of date
  const needsBalanceReconciliation = React.useMemo(() => {
    if (!forecast || !forecast.last_reconciled_date) return true;
    
    const lastReconciled = parseISO(forecast.last_reconciled_date);
    const today = new Date();
    const daysSinceUpdate = differenceInDays(today, lastReconciled);
    
    // If it's been more than 7 days since the last reconciliation
    return daysSinceUpdate > 7;
  }, [forecast]);
  
  // Reset options when the dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setReconcileBalances(needsBalanceReconciliation);
    }
  }, [isOpen, needsBalanceReconciliation]);
  
  const handleGenerate = () => {
    onGenerate({
      ...options,
      reconcileBalances,
      useRollingForecast: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className={`max-w-3xl ${isMobile ? 'p-4 h-[90vh] overflow-y-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle>Actualizar Pronóstico de Flujo de Efectivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Reconciliation Option */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-medium">Reconciliación de Saldos</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="reconcile-balances" className="font-medium">
                    Confirmar saldos actuales
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {needsBalanceReconciliation 
                    ? "Los saldos no han sido confirmados recientemente" 
                    : "Saldos confirmados recientemente"}
                </p>
              </div>
              <Switch 
                id="reconcile-balances" 
                checked={reconcileBalances}
                onCheckedChange={setReconcileBalances}
              />
            </div>
            
            {reconcileBalances && (
              <div className="rounded-md bg-blue-50 p-3 mt-2">
                <div className="flex">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Saldos que serán confirmados:</p>
                    <ul className="mt-1 list-disc list-inside">
                      <li>Disponible en cuentas de banco y efectivo: {new Intl.NumberFormat('es-MX', {
                        style: 'currency', currency: 'MXN'
                      }).format(historicalDataCount.availableCashBalance || 0)}</li>
                      <li>Pasivos en tarjetas de crédito: {new Intl.NumberFormat('es-MX', {
                        style: 'currency', currency: 'MXN'
                      }).format(historicalDataCount.creditLiabilities || 0)}</li>
                      <li>Posición neta: {new Intl.NumberFormat('es-MX', {
                        style: 'currency', currency: 'MXN'
                      }).format(historicalDataCount.netPosition || 0)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator />

          {/* Data Sources and Settings Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataSourcesPanel historicalDataCount={historicalDataCount} />
            
            <ForecastOptionsPanel 
              options={options}
              onOptionChange={handleOptionChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {reconcileBalances ? 'Actualizar y Confirmar Saldos' : 'Actualizar Pronóstico'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
