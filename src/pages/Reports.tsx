
import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useFinancialPeriods } from "@/hooks/financial-reporting/useFinancialPeriods";
import { FinancialPeriod, FinancialPeriodType } from "@/types/financial-reporting";
import { toast } from "@/components/ui/use-toast";
import { IncomeStatement } from "@/components/reports/IncomeStatement";
import { CashFlow } from "@/components/reports/CashFlow";
import { BalanceSheet } from "@/components/reports/BalanceSheet";
import { ChannelIncomeStatement } from "@/components/reports/ChannelIncomeStatement";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Reports() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // State for report filtering
  const [periodType, setPeriodType] = React.useState<FinancialPeriodType>('month');
  const [selectedPeriod, setSelectedPeriod] = React.useState<string | null>(null);
  const [compareWithPreviousYear, setCompareWithPreviousYear] = React.useState(false);
  
  // Get financial periods
  const { 
    periods, 
    isLoading: periodsLoading, 
    error: periodsError,
    initializePeriods,
    closePeriod,
    getCurrentPeriod
  } = useFinancialPeriods(periodType);
  
  // Initialize periods if none exist
  React.useEffect(() => {
    if (periods && periods.length === 0) {
      initializePeriods();
    } else if (periods && periods.length > 0 && !selectedPeriod) {
      const currentPeriod = getCurrentPeriod();
      if (currentPeriod) {
        setSelectedPeriod(currentPeriod.id);
      }
    }
  }, [periods, initializePeriods, getCurrentPeriod, selectedPeriod]);
  
  // Find the currently selected period object
  const currentPeriod = React.useMemo(() => {
    if (!periods || !selectedPeriod) return null;
    return periods.find(p => p.id === selectedPeriod) || null;
  }, [periods, selectedPeriod]);
  
  // Handle period type change
  const handlePeriodTypeChange = (value: string) => {
    setPeriodType(value as FinancialPeriodType);
    setSelectedPeriod(null); // Reset selected period when type changes
  };
  
  // Handle period selection change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
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
  
  // Format period label for display
  const formatPeriodLabel = (period: FinancialPeriod) => {
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);
    
    if (period.period_type === 'day') {
      return `${format(startDate, 'dd/MM/yyyy')}`;
    } else if (period.period_type === 'month') {
      return `${format(startDate, 'MMMM yyyy')}`;
    } else if (period.period_type === 'quarter') {
      return `Q${period.period} ${period.year}`;
    } else {
      return `${period.year}`;
    }
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
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <Label htmlFor="period-type">Tipo de Período</Label>
          <Select value={periodType} onValueChange={handlePeriodTypeChange}>
            <SelectTrigger id="period-type">
              <SelectValue placeholder="Seleccionar tipo de período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diario</SelectItem>
              <SelectItem value="month">Mensual</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="period-select">Período</Label>
          {periodsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedPeriod || ''} onValueChange={handlePeriodChange}>
              <SelectTrigger id="period-select">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {periods && periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {formatPeriodLabel(period)}
                    {period.is_closed ? ' (Cerrado)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="compare-year" 
              checked={compareWithPreviousYear}
              onCheckedChange={setCompareWithPreviousYear}
            />
            <Label htmlFor="compare-year">Comparar con año anterior</Label>
          </div>
          
          {currentPeriod && !currentPeriod.is_closed && (
            <Button 
              variant="outline" 
              onClick={handleClosePeriod}
              className="whitespace-nowrap"
            >
              Cerrar Período
            </Button>
          )}
        </div>
      </div>
      
      {/* Current Period Info */}
      {currentPeriod && (
        <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
          <p className="text-sm">
            <span className="font-medium">Período actual: </span>
            {formatPeriodLabel(currentPeriod)}
            {currentPeriod.is_closed && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Cerrado
              </span>
            )}
          </p>
          <p className="text-sm">
            <span className="font-medium">Fechas: </span>
            {format(new Date(currentPeriod.start_date), 'dd/MM/yyyy')} - {format(new Date(currentPeriod.end_date), 'dd/MM/yyyy')}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="income" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="income">Estado de Resultados</TabsTrigger>
            <TabsTrigger value="cash-flow">Flujo de Efectivo</TabsTrigger>
            <TabsTrigger value="balance">Balance General</TabsTrigger>
            <TabsTrigger value="channel-income">Por Canal</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Estado de Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPeriod ? (
                <IncomeStatement 
                  userId={user?.id} 
                  periodId={currentPeriod.id}
                  periodType={periodType}
                  compareWithPreviousYear={compareWithPreviousYear}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Seleccione un período para ver el estado de resultados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Flujo de Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPeriod ? (
                <CashFlow 
                  userId={user?.id} 
                  periodId={currentPeriod.id}
                  periodType={periodType}
                  compareWithPreviousYear={compareWithPreviousYear}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Seleccione un período para ver el flujo de efectivo
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Balance General</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPeriod ? (
                <BalanceSheet 
                  userId={user?.id} 
                  periodId={currentPeriod.id}
                  periodType={periodType}
                  compareWithPreviousYear={compareWithPreviousYear}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Seleccione un período para ver el balance general
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel-income">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Estado de Resultados por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPeriod ? (
                <ChannelIncomeStatement 
                  userId={user?.id} 
                  periodId={currentPeriod.id}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Seleccione un período para ver el estado de resultados por canal
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
