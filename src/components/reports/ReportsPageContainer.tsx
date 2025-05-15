
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialPeriods } from "@/hooks/financial-reporting/useFinancialPeriods";
import { FinancialPeriodType } from "@/types/financial-reporting";
import { PeriodControls } from "./components/PeriodControls";
import { PeriodInfo } from "./components/PeriodInfo";
import { ReportTabs } from "./components/ReportTabs";
import { AccountBalanceEditor } from "./AccountBalanceEditor";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function ReportsPageContainer() {
  const { user } = useAuth();
  
  // State for report filtering
  const [periodType, setPeriodType] = React.useState<FinancialPeriodType>('month');
  const [selectedPeriod, setSelectedPeriod] = React.useState<string | null>(null);
  const [compareWithPreviousYear, setCompareWithPreviousYear] = React.useState(false);
  
  // State for account balance editor
  const [isBalanceEditorOpen, setIsBalanceEditorOpen] = React.useState(false);
  
  // Get financial periods
  const { 
    periods, 
    isLoading: periodsLoading, 
    error: periodsError,
    initializePeriods,
    closePeriod,
    getCurrentPeriod,
    initializeAccountsForPeriod
  } = useFinancialPeriods(periodType);
  
  // Initialize periods if none exist
  React.useEffect(() => {
    if (periods && periods.length === 0) {
      // No periods exist, let the user initialize them
      toast({
        title: "No hay períodos financieros",
        description: "Haga clic en 'Crear Períodos' para inicializar los períodos financieros.",
      });
    } else if (periods && periods.length > 0 && !selectedPeriod) {
      const currentPeriod = getCurrentPeriod();
      if (currentPeriod) {
        setSelectedPeriod(currentPeriod.id);
      }
    }
  }, [periods, getCurrentPeriod, selectedPeriod]);
  
  // Find the currently selected period object
  const currentPeriod = React.useMemo(() => {
    if (!periods || !selectedPeriod) return null;
    return periods.find(p => p.id === selectedPeriod) || null;
  }, [periods, selectedPeriod]);
  
  // Handle period type change
  const handlePeriodTypeChange = (value: FinancialPeriodType) => {
    setPeriodType(value);
    setSelectedPeriod(null); // Reset selected period when type changes
  };
  
  // Handle period selection change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };
  
  // Handle creating periods
  const handleCreatePeriods = () => {
    initializePeriods();
  };
  
  // Handle closing a period
  const handleClosePeriod = () => {
    if (!currentPeriod) {
      toast({
        title: "Error",
        description: "No hay período seleccionado para cerrar",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPeriod.is_closed) {
      toast({
        title: "Error",
        description: "Este período ya está cerrado",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm(`¿Estás seguro de cerrar este período? Una vez cerrado, no podrás modificar los datos financieros de este período.`)) {
      closePeriod(currentPeriod.id);
    }
  };
  
  // Handle toggling compare with previous year
  const handleToggleCompare = (checked: boolean) => {
    setCompareWithPreviousYear(checked);
  };
  
  // Handle opening balance editor
  const handleOpenBalanceEditor = () => {
    if (!selectedPeriod) {
      toast({
        title: "Error",
        description: "Seleccione un período primero",
        variant: "destructive"
      });
      return;
    }

    // Initialize accounts for the selected period if they don't exist yet
    if (currentPeriod && !currentPeriod.is_closed) {
      initializeAccountsForPeriod(selectedPeriod);
    }
    
    setIsBalanceEditorOpen(true);
  };
  
  // Show error if any
  if (periodsError) {
    return (
      <div className="container mx-auto p-2 sm:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los períodos financieros. Por favor, intente de nuevo más tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Reportes Contables</h1>
      
      {/* Period Controls */}
      <PeriodControls
        periodType={periodType}
        periods={periods}
        selectedPeriod={selectedPeriod}
        isLoading={periodsLoading}
        currentPeriod={currentPeriod}
        compareWithPreviousYear={compareWithPreviousYear}
        onPeriodTypeChange={handlePeriodTypeChange}
        onPeriodChange={handlePeriodChange}
        onCreatePeriods={handleCreatePeriods}
        onToggleCompare={handleToggleCompare}
        onClosePeriod={handleClosePeriod}
      />
      
      {/* Current Period Info */}
      {currentPeriod && (
        <div className="flex justify-between items-center">
          <PeriodInfo period={currentPeriod} />
          <Button 
            onClick={handleOpenBalanceEditor}
            disabled={!selectedPeriod || (currentPeriod && currentPeriod.is_closed)}
            variant="outline"
          >
            {currentPeriod && currentPeriod.is_closed 
              ? "Período cerrado" 
              : "Editar Saldos de Cuentas"}
          </Button>
        </div>
      )}
      
      {/* Report Tabs */}
      <ReportTabs
        userId={user?.id}
        periodId={selectedPeriod}
        periodType={periodType}
        compareWithPreviousYear={compareWithPreviousYear}
        periodsExist={!!periods && periods.length > 0}
      />
      
      {/* Account Balance Editor */}
      <AccountBalanceEditor 
        isOpen={isBalanceEditorOpen}
        onClose={() => setIsBalanceEditorOpen(false)}
        periodId={selectedPeriod || ''}
        period={currentPeriod}
      />
    </div>
  );
}
