
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO, differenceInDays } from "date-fns";
import { ForecastOptions, ForecastDataCount } from "./forecast-generation/types";
import { CashFlowForecast } from "@/types/cashFlow";
import { ForecastDialogContent } from "./forecast-generation/ForecastDialogContent";

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

        <ForecastDialogContent
          options={options}
          onOptionChange={handleOptionChange}
          reconcileBalances={reconcileBalances}
          setReconcileBalances={setReconcileBalances}
          needsBalanceReconciliation={needsBalanceReconciliation}
          historicalDataCount={historicalDataCount}
        />

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
