
import React from "react";
import { useFinancialReports } from "@/hooks/financial-reporting/useFinancialReports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface CashFlowProps {
  userId?: string;
  periodId: string;
  periodType: 'day' | 'month' | 'quarter' | 'year';
  compareWithPreviousYear?: boolean;
}

export const CashFlow: React.FC<CashFlowProps> = ({
  userId,
  periodId,
  periodType,
  compareWithPreviousYear = false
}) => {
  // Fetch the report data
  const { reportData, isLoading, error } = useFinancialReports('cash_flow', {
    periodId,
    periodType,
    compareWithPreviousYear
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudo cargar el flujo de efectivo. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Structure data for display
  const prepareData = () => {
    if (!reportData || !reportData.currentPeriod) {
      return {
        operating: {
          'Utilidad Neta': 0,
          'Depreciación y Amortización': 0,
          'Cambios en Cuentas por Cobrar': 0,
          'Cambios en Inventario': 0,
          'Cambios en Cuentas por Pagar': 0,
          'Flujo Neto de Actividades Operativas': 0
        },
        investing: {
          'Compra de Activos Fijos': 0,
          'Venta de Activos': 0,
          'Inversiones Financieras': 0,
          'Flujo Neto de Actividades de Inversión': 0
        },
        financing: {
          'Préstamos Recibidos': 0,
          'Pagos de Préstamos': 0,
          'Dividendos Pagados': 0,
          'Flujo Neto de Actividades de Financiamiento': 0
        },
        summary: {
          'Incremento Neto en Efectivo': 0,
          'Efectivo al Inicio del Período': 0,
          'Efectivo al Final del Período': 0
        }
      };
    }

    const currentPeriodData = reportData.currentPeriod.data;
    
    // Extract operating activities
    const operating = {
      'Utilidad Neta': currentPeriodData['net_income'] || 0,
      'Depreciación y Amortización': currentPeriodData['depreciation_amortization'] || 0,
      'Cambios en Cuentas por Cobrar': currentPeriodData['accounts_receivable_change'] || 0,
      'Cambios en Inventario': currentPeriodData['inventory_change'] || 0,
      'Cambios en Cuentas por Pagar': currentPeriodData['accounts_payable_change'] || 0
    };
    operating['Flujo Neto de Actividades Operativas'] = 
      operating['Utilidad Neta'] + 
      operating['Depreciación y Amortización'] +
      operating['Cambios en Cuentas por Cobrar'] +
      operating['Cambios en Inventario'] +
      operating['Cambios en Cuentas por Pagar'];
    
    // Extract investing activities
    const investing = {
      'Compra de Activos Fijos': currentPeriodData['asset_purchase'] || 0,
      'Venta de Activos': currentPeriodData['asset_sale'] || 0,
      'Inversiones Financieras': currentPeriodData['financial_investments'] || 0
    };
    investing['Flujo Neto de Actividades de Inversión'] = 
      investing['Compra de Activos Fijos'] +
      investing['Venta de Activos'] +
      investing['Inversiones Financieras'];
    
    // Extract financing activities
    const financing = {
      'Préstamos Recibidos': currentPeriodData['loans_received'] || 0,
      'Pagos de Préstamos': currentPeriodData['loan_payments'] || 0,
      'Dividendos Pagados': currentPeriodData['dividends_paid'] || 0
    };
    financing['Flujo Neto de Actividades de Financiamiento'] = 
      financing['Préstamos Recibidos'] +
      financing['Pagos de Préstamos'] +
      financing['Dividendos Pagados'];
    
    // Calculate summary
    const summary = {
      'Incremento Neto en Efectivo': 
        operating['Flujo Neto de Actividades Operativas'] +
        investing['Flujo Neto de Actividades de Inversión'] +
        financing['Flujo Neto de Actividades de Financiamiento'],
      'Efectivo al Inicio del Período': currentPeriodData['beginning_cash'] || 0,
      'Efectivo al Final del Período': 0
    };
    summary['Efectivo al Final del Período'] = 
      summary['Efectivo al Inicio del Período'] + 
      summary['Incremento Neto en Efectivo'];
    
    return { operating, investing, financing, summary };
  };

  const reportDataFormatted = prepareData();

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Format the date range for display
  const getDateRangeText = () => {
    if (!reportData?.currentPeriod) {
      if (periodType === 'month') {
        return 'Período mensual';
      } else if (periodType === 'quarter') {
        return 'Período trimestral';
      } else if (periodType === 'year') {
        return 'Período anual';
      } else {
        return 'Período diario';
      }
    }

    const startDate = new Date(reportData.currentPeriod.startDate);
    const endDate = new Date(reportData.currentPeriod.endDate);
    
    return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
  };

  // Function to get previous period value if comparing
  const getPreviousValue = (section: string, item: string) => {
    if (!reportData?.previousPeriod) return 0;
    
    const prevData = reportData.previousPeriod.data;
    
    if (section === 'operating') {
      if (item === 'Utilidad Neta') return prevData['net_income'] || 0;
      if (item === 'Depreciación y Amortización') return prevData['depreciation_amortization'] || 0;
      if (item === 'Cambios en Cuentas por Cobrar') return prevData['accounts_receivable_change'] || 0;
      if (item === 'Cambios en Inventario') return prevData['inventory_change'] || 0;
      if (item === 'Cambios en Cuentas por Pagar') return prevData['accounts_payable_change'] || 0;
      if (item === 'Flujo Neto de Actividades Operativas') {
        return (prevData['net_income'] || 0) + 
               (prevData['depreciation_amortization'] || 0) +
               (prevData['accounts_receivable_change'] || 0) +
               (prevData['inventory_change'] || 0) +
               (prevData['accounts_payable_change'] || 0);
      }
    }
    
    if (section === 'investing') {
      if (item === 'Compra de Activos Fijos') return prevData['asset_purchase'] || 0;
      if (item === 'Venta de Activos') return prevData['asset_sale'] || 0;
      if (item === 'Inversiones Financieras') return prevData['financial_investments'] || 0;
      if (item === 'Flujo Neto de Actividades de Inversión') {
        return (prevData['asset_purchase'] || 0) +
               (prevData['asset_sale'] || 0) +
               (prevData['financial_investments'] || 0);
      }
    }
    
    if (section === 'financing') {
      if (item === 'Préstamos Recibidos') return prevData['loans_received'] || 0;
      if (item === 'Pagos de Préstamos') return prevData['loan_payments'] || 0;
      if (item === 'Dividendos Pagados') return prevData['dividends_paid'] || 0;
      if (item === 'Flujo Neto de Actividades de Financiamiento') {
        return (prevData['loans_received'] || 0) +
               (prevData['loan_payments'] || 0) +
               (prevData['dividends_paid'] || 0);
      }
    }
    
    if (section === 'summary') {
      const opNetFlow = (prevData['net_income'] || 0) + 
                      (prevData['depreciation_amortization'] || 0) +
                      (prevData['accounts_receivable_change'] || 0) +
                      (prevData['inventory_change'] || 0) +
                      (prevData['accounts_payable_change'] || 0);
                      
      const invNetFlow = (prevData['asset_purchase'] || 0) +
                       (prevData['asset_sale'] || 0) +
                       (prevData['financial_investments'] || 0);
                       
      const finNetFlow = (prevData['loans_received'] || 0) +
                       (prevData['loan_payments'] || 0) +
                       (prevData['dividends_paid'] || 0);
      
      if (item === 'Incremento Neto en Efectivo') return opNetFlow + invNetFlow + finNetFlow;
      if (item === 'Efectivo al Inicio del Período') return prevData['beginning_cash'] || 0;
      if (item === 'Efectivo al Final del Período') {
        return (prevData['beginning_cash'] || 0) + opNetFlow + invNetFlow + finNetFlow;
      }
    }
    
    return 0;
  };

  // Calculate percentage change if we have comparison data
  const calculateChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return change.toFixed(2) + '%';
  };

  // Handle export to Excel/PDF
  const handleExport = () => {
    alert("Export functionality will be implemented soon");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500">Período:</h3>
          <p className="font-medium">{getDateRangeText()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Concepto</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            {compareWithPreviousYear && (
              <>
                <TableHead className="text-right">Año Anterior</TableHead>
                <TableHead className="text-right">Variación</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Operating Activities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVIDADES OPERATIVAS
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.operating).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('operating', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
            const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
                  {item}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(amount))}
                </TableCell>
                {compareWithPreviousYear && (
                  <>
                    <TableCell className="text-right">
                      {formatCurrency(previousAmount!)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
                        {isPositiveChange ? "+" : ""}{changePercent}
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
          
          {/* Investing Activities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVIDADES DE INVERSIÓN
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.investing).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('investing', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
            // For investments, negative numbers are actually good (less spending)
            const isPositiveChange = previousAmount !== undefined && 
              ((Number(amount) < 0 && Number(amount) > previousAmount) || 
               (Number(amount) >= 0 && Number(amount) > previousAmount));
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
                  {item}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(amount))}
                </TableCell>
                {compareWithPreviousYear && (
                  <>
                    <TableCell className="text-right">
                      {formatCurrency(previousAmount!)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
                        {isPositiveChange ? "+" : ""}{changePercent}
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
          
          {/* Financing Activities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVIDADES DE FINANCIAMIENTO
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.financing).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('financing', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
            const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
                  {item}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(amount))}
                </TableCell>
                {compareWithPreviousYear && (
                  <>
                    <TableCell className="text-right">
                      {formatCurrency(previousAmount!)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
                        {isPositiveChange ? "+" : ""}{changePercent}
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
          
          {/* Summary Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              RESUMEN
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.summary).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('summary', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
            const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className="font-medium">
                  {item}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(amount))}
                </TableCell>
                {compareWithPreviousYear && (
                  <>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(previousAmount!)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
                        {isPositiveChange ? "+" : ""}{changePercent}
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {!reportData || Object.keys(reportData.currentPeriod?.data || {}).length === 0 ? (
        <div className="mt-4 border border-yellow-200 bg-yellow-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">No hay datos de cuentas</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Para ver reportes financieros, necesita agregar saldos a sus cuentas para este período.
          </p>
        </div>
      ) : null}
    </div>
  );
};
