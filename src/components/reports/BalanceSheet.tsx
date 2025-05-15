
import React from "react";
import { useFinancialReports } from "@/hooks/financial-reporting/useFinancialReports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface BalanceSheetProps {
  userId?: string;
  periodId: string;
  periodType: 'day' | 'month' | 'quarter' | 'year';
  compareWithPreviousYear?: boolean;
}

export const BalanceSheet: React.FC<BalanceSheetProps> = ({
  userId,
  periodId,
  periodType,
  compareWithPreviousYear = false
}) => {
  // Fetch the report data
  const { reportData, isLoading, error } = useFinancialReports('balance_sheet', {
    periodId,
    periodType,
    compareWithPreviousYear,
    year: 0 // Dummy value, won't be used since periodId is provided
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
          No se pudo cargar el balance general. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Structure data for display
  const prepareData = () => {
    if (!reportData || !reportData.currentPeriod) {
      return {
        assets: {
          'Activo Circulante': {
            'Efectivo': 0,
            'Cuentas por Cobrar': 0,
            'Inventario': 0,
            'Total Activo Circulante': 0
          },
          'Activo Fijo': {
            'Propiedades': 0,
            'Equipo': 0,
            'Depreciación Acumulada': 0,
            'Total Activo Fijo': 0
          },
          'Total Activos': 0
        },
        liabilities: {
          'Pasivo Circulante': {
            'Cuentas por Pagar': 0,
            'Préstamos a Corto Plazo': 0,
            'Total Pasivo Circulante': 0
          },
          'Pasivo a Largo Plazo': {
            'Préstamos Bancarios': 0,
            'Hipotecas': 0,
            'Total Pasivo a Largo Plazo': 0
          },
          'Total Pasivos': 0
        },
        equity: {
          'Capital Social': 0,
          'Utilidades Retenidas': 0,
          'Utilidad del Ejercicio': 0,
          'Total Capital Contable': 0
        }
      };
    }

    const currentPeriodData = reportData.currentPeriod.data;
    
    // Map data from account types to our display structure
    const assets = {
      'Activo Circulante': {
        'Efectivo': currentPeriodData['cash'] || 0,
        'Cuentas por Cobrar': currentPeriodData['accounts_receivable'] || 0,
        'Inventario': currentPeriodData['inventory'] || 0,
        'Total Activo Circulante': 0
      },
      'Activo Fijo': {
        'Propiedades': currentPeriodData['property'] || 0,
        'Equipo': currentPeriodData['equipment'] || 0,
        'Depreciación Acumulada': currentPeriodData['accumulated_depreciation'] || 0,
        'Total Activo Fijo': 0
      },
      'Total Activos': 0
    };
    
    assets['Activo Circulante']['Total Activo Circulante'] = 
      assets['Activo Circulante']['Efectivo'] + 
      assets['Activo Circulante']['Cuentas por Cobrar'] + 
      assets['Activo Circulante']['Inventario'];
      
    assets['Activo Fijo']['Total Activo Fijo'] = 
      assets['Activo Fijo']['Propiedades'] + 
      assets['Activo Fijo']['Equipo'] + 
      assets['Activo Fijo']['Depreciación Acumulada'];
      
    assets['Total Activos'] = 
      assets['Activo Circulante']['Total Activo Circulante'] + 
      assets['Activo Fijo']['Total Activo Fijo'];
    
    const liabilities = {
      'Pasivo Circulante': {
        'Cuentas por Pagar': currentPeriodData['accounts_payable'] || 0,
        'Préstamos a Corto Plazo': currentPeriodData['short_term_loans'] || 0,
        'Total Pasivo Circulante': 0
      },
      'Pasivo a Largo Plazo': {
        'Préstamos Bancarios': currentPeriodData['bank_loans'] || 0,
        'Hipotecas': currentPeriodData['mortgages'] || 0,
        'Total Pasivo a Largo Plazo': 0
      },
      'Total Pasivos': 0
    };
    
    liabilities['Pasivo Circulante']['Total Pasivo Circulante'] = 
      liabilities['Pasivo Circulante']['Cuentas por Pagar'] + 
      liabilities['Pasivo Circulante']['Préstamos a Corto Plazo'];
      
    liabilities['Pasivo a Largo Plazo']['Total Pasivo a Largo Plazo'] = 
      liabilities['Pasivo a Largo Plazo']['Préstamos Bancarios'] + 
      liabilities['Pasivo a Largo Plazo']['Hipotecas'];
      
    liabilities['Total Pasivos'] = 
      liabilities['Pasivo Circulante']['Total Pasivo Circulante'] + 
      liabilities['Pasivo a Largo Plazo']['Total Pasivo a Largo Plazo'];
    
    const equity = {
      'Capital Social': currentPeriodData['capital_stock'] || 0,
      'Utilidades Retenidas': currentPeriodData['retained_earnings'] || 0,
      'Utilidad del Ejercicio': currentPeriodData['current_earnings'] || 0,
      'Total Capital Contable': 0
    };
    
    equity['Total Capital Contable'] = 
      equity['Capital Social'] + 
      equity['Utilidades Retenidas'] + 
      equity['Utilidad del Ejercicio'];
    
    return { assets, liabilities, equity };
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
    if (!reportData?.currentPeriod) return "";

    const endDate = new Date(reportData.currentPeriod.endDate);
    
    return format(endDate, 'dd/MM/yyyy');
  };

  // Handle export to Excel/PDF
  const handleExport = () => {
    alert("Export functionality will be implemented soon");
  };

  // Function to get previous period value if comparing
  const getPreviousValue = (section: 'assets' | 'liabilities' | 'equity', category: string, item?: string) => {
    if (!reportData?.previousPeriod) return 0;
    
    const prevData = reportData.previousPeriod.data;
    
    if (section === 'assets') {
      if (category === 'Activo Circulante') {
        if (item === 'Efectivo') return prevData['cash'] || 0;
        if (item === 'Cuentas por Cobrar') return prevData['accounts_receivable'] || 0;
        if (item === 'Inventario') return prevData['inventory'] || 0;
        if (item === 'Total Activo Circulante') {
          return (prevData['cash'] || 0) + 
                 (prevData['accounts_receivable'] || 0) + 
                 (prevData['inventory'] || 0);
        }
      }
      
      if (category === 'Activo Fijo') {
        if (item === 'Propiedades') return prevData['property'] || 0;
        if (item === 'Equipo') return prevData['equipment'] || 0;
        if (item === 'Depreciación Acumulada') return prevData['accumulated_depreciation'] || 0;
        if (item === 'Total Activo Fijo') {
          return (prevData['property'] || 0) + 
                 (prevData['equipment'] || 0) + 
                 (prevData['accumulated_depreciation'] || 0);
        }
      }
      
      if (category === 'Total Activos') {
        const currentAssets = (prevData['cash'] || 0) + 
                            (prevData['accounts_receivable'] || 0) + 
                            (prevData['inventory'] || 0);
                            
        const fixedAssets = (prevData['property'] || 0) + 
                           (prevData['equipment'] || 0) + 
                           (prevData['accumulated_depreciation'] || 0);
                           
        return currentAssets + fixedAssets;
      }
    }
    
    if (section === 'liabilities') {
      if (category === 'Pasivo Circulante') {
        if (item === 'Cuentas por Pagar') return prevData['accounts_payable'] || 0;
        if (item === 'Préstamos a Corto Plazo') return prevData['short_term_loans'] || 0;
        if (item === 'Total Pasivo Circulante') {
          return (prevData['accounts_payable'] || 0) + 
                 (prevData['short_term_loans'] || 0);
        }
      }
      
      if (category === 'Pasivo a Largo Plazo') {
        if (item === 'Préstamos Bancarios') return prevData['bank_loans'] || 0;
        if (item === 'Hipotecas') return prevData['mortgages'] || 0;
        if (item === 'Total Pasivo a Largo Plazo') {
          return (prevData['bank_loans'] || 0) + 
                 (prevData['mortgages'] || 0);
        }
      }
      
      if (category === 'Total Pasivos') {
        const currentLiabilities = (prevData['accounts_payable'] || 0) + 
                                 (prevData['short_term_loans'] || 0);
                                 
        const longTermLiabilities = (prevData['bank_loans'] || 0) + 
                                  (prevData['mortgages'] || 0);
                                  
        return currentLiabilities + longTermLiabilities;
      }
    }
    
    if (section === 'equity') {
      if (category === 'Capital Social') return prevData['capital_stock'] || 0;
      if (category === 'Utilidades Retenidas') return prevData['retained_earnings'] || 0;
      if (category === 'Utilidad del Ejercicio') return prevData['current_earnings'] || 0;
      if (category === 'Total Capital Contable') {
        return (prevData['capital_stock'] || 0) + 
               (prevData['retained_earnings'] || 0) + 
               (prevData['current_earnings'] || 0);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500">Fecha:</h3>
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
          {/* Assets Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVOS
            </TableCell>
          </TableRow>
          
          {/* Current Assets */}
          {Object.entries(reportDataFormatted.assets['Activo Circulante']).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear 
              ? getPreviousValue('assets', 'Activo Circulante', item)
              : undefined;
            const changePercent = compareWithPreviousYear 
              ? calculateChange(Number(amount), previousAmount)
              : null;
            const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Total') ? "font-medium" : "pl-6"}>
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
          
          {/* Fixed Assets */}
          {Object.entries(reportDataFormatted.assets['Activo Fijo']).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear 
              ? getPreviousValue('assets', 'Activo Fijo', item)
              : undefined;
            const changePercent = compareWithPreviousYear 
              ? calculateChange(Number(amount), previousAmount)
              : null;
            const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Total') ? "font-medium" : "pl-6"}>
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
          
          {/* Total Assets */}
          <TableRow>
            <TableCell className="font-bold">TOTAL ACTIVOS</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(reportDataFormatted.assets['Total Activos'])}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency(getPreviousValue('assets', 'Total Activos'))}
                </TableCell>
                <TableCell className="text-right">
                  <span className={reportDataFormatted.assets['Total Activos'] > getPreviousValue('assets', 'Total Activos') 
                    ? "text-green-600" 
                    : "text-red-600"}>
                    {calculateChange(reportDataFormatted.assets['Total Activos'], getPreviousValue('assets', 'Total Activos'))}
                  </span>
                </TableCell>
              </>
            )}
          </TableRow>
          
          {/* Liabilities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              PASIVOS
            </TableCell>
          </TableRow>
          
          {/* Current Liabilities */}
          {Object.entries(reportDataFormatted.liabilities['Pasivo Circulante']).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear 
              ? getPreviousValue('liabilities', 'Pasivo Circulante', item)
              : undefined;
            const changePercent = compareWithPreviousYear 
              ? calculateChange(Number(amount), previousAmount)
              : null;
            const isNegativeChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Total') ? "font-medium" : "pl-6"}>
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
                      <span className={isNegativeChange ? "text-red-600" : "text-green-600"}>
                        {isNegativeChange ? "+" : "-"}{changePercent}
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
          
          {/* Long-term Liabilities */}
          {Object.entries(reportDataFormatted.liabilities['Pasivo a Largo Plazo']).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear 
              ? getPreviousValue('liabilities', 'Pasivo a Largo Plazo', item)
              : undefined;
            const changePercent = compareWithPreviousYear 
              ? calculateChange(Number(amount), previousAmount)
              : null;
            const isNegativeChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className={item.includes('Total') ? "font-medium" : "pl-6"}>
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
                      <span className={isNegativeChange ? "text-red-600" : "text-green-600"}>
                        {isNegativeChange ? "+" : "-"}{changePercent}
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
          
          {/* Total Liabilities */}
          <TableRow>
            <TableCell className="font-bold">TOTAL PASIVOS</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(reportDataFormatted.liabilities['Total Pasivos'])}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency(getPreviousValue('liabilities', 'Total Pasivos'))}
                </TableCell>
                <TableCell className="text-right">
                  <span className={reportDataFormatted.liabilities['Total Pasivos'] < getPreviousValue('liabilities', 'Total Pasivos') 
                    ? "text-green-600" 
                    : "text-red-600"}>
                    {calculateChange(reportDataFormatted.liabilities['Total Pasivos'], getPreviousValue('liabilities', 'Total Pasivos'))}
                  </span>
                </TableCell>
              </>
            )}
          </TableRow>
          
          {/* Equity Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              CAPITAL
            </TableCell>
          </TableRow>
          
          {/* Equity Items */}
          {Object.entries(reportDataFormatted.equity).map(([item, amount]) => {
            if (item !== 'Total Capital Contable') {
              const previousAmount = compareWithPreviousYear 
                ? getPreviousValue('equity', item)
                : undefined;
              const changePercent = compareWithPreviousYear 
                ? calculateChange(Number(amount), previousAmount)
                : null;
              const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
              
              return (
                <TableRow key={item}>
                  <TableCell className={item === 'Utilidad del Ejercicio' ? "font-medium" : "pl-6"}>
                    {item}
                  </TableCell>
                  <TableCell className={`text-right ${item === 'Utilidad del Ejercicio' ? "font-medium" : ""}`}>
                    {formatCurrency(Number(amount))}
                  </TableCell>
                  {compareWithPreviousYear && (
                    <>
                      <TableCell className={`text-right ${item === 'Utilidad del Ejercicio' ? "font-medium" : ""}`}>
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
            }
            return null;
          })}
          
          {/* Total Equity */}
          <TableRow>
            <TableCell className="font-bold">TOTAL CAPITAL</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(reportDataFormatted.equity['Total Capital Contable'])}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency(getPreviousValue('equity', 'Total Capital Contable'))}
                </TableCell>
                <TableCell className="text-right">
                  <span className={reportDataFormatted.equity['Total Capital Contable'] > getPreviousValue('equity', 'Total Capital Contable') 
                    ? "text-green-600" 
                    : "text-red-600"}>
                    {calculateChange(
                      reportDataFormatted.equity['Total Capital Contable'], 
                      getPreviousValue('equity', 'Total Capital Contable')
                    )}
                  </span>
                </TableCell>
              </>
            )}
          </TableRow>
          
          {/* Liabilities + Equity Total */}
          <TableRow className="border-t-2 border-gray-200">
            <TableCell className="font-bold">TOTAL PASIVO + CAPITAL</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(
                reportDataFormatted.liabilities['Total Pasivos'] + 
                reportDataFormatted.equity['Total Capital Contable']
              )}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency(
                    getPreviousValue('liabilities', 'Total Pasivos') + 
                    getPreviousValue('equity', 'Total Capital Contable')
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className={
                    (reportDataFormatted.liabilities['Total Pasivos'] + reportDataFormatted.equity['Total Capital Contable']) > 
                    (getPreviousValue('liabilities', 'Total Pasivos') + getPreviousValue('equity', 'Total Capital Contable'))
                      ? "text-green-600" 
                      : "text-red-600"
                  }>
                    {calculateChange(
                      reportDataFormatted.liabilities['Total Pasivos'] + reportDataFormatted.equity['Total Capital Contable'],
                      getPreviousValue('liabilities', 'Total Pasivos') + getPreviousValue('equity', 'Total Capital Contable')
                    )}
                  </span>
                </TableCell>
              </>
            )}
          </TableRow>
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
