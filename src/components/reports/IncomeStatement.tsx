
import React from "react";
import { useFinancialReports } from "@/hooks/financial-reporting/useFinancialReports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface IncomeStatementProps {
  userId?: string;
  periodId: string;
  periodType: 'day' | 'month' | 'quarter' | 'year';
  compareWithPreviousYear?: boolean;
}

export const IncomeStatement: React.FC<IncomeStatementProps> = ({
  userId,
  periodId,
  periodType,
  compareWithPreviousYear = false
}) => {
  // Fetch the report data
  const { reportData, isLoading, error } = useFinancialReports('income_statement', {
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
          No se pudo cargar el estado de resultados. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Structure data for display
  const prepareData = () => {
    if (!reportData || !reportData.currentPeriod) {
      return {
        revenue: {
          'Ventas': 0,
          'Servicios': 0,
          'Total Ingresos': 0
        },
        expenses: {
          'Costo de Ventas': 0,
          'Gastos Operativos': 0,
          'Gastos Administrativos': 0,
          'Total Gastos': 0
        },
        summary: {
          'Utilidad Bruta': 0,
          'Utilidad Operativa': 0,
          'Utilidad Neta': 0
        }
      };
    }

    const currentPeriodData = reportData.currentPeriod.data;
    
    // Extract revenue accounts
    const revenue = {
      'Ventas': currentPeriodData['revenue'] || 0,
      'Servicios': currentPeriodData['service_revenue'] || 0
    };
    revenue['Total Ingresos'] = Object.values(revenue).reduce((sum, val) => sum + Number(val), 0);

    // Extract expense accounts
    const expenses = {
      'Costo de Ventas': currentPeriodData['cost_of_sales'] || 0,
      'Gastos Operativos': currentPeriodData['operating_expenses'] || 0,
      'Gastos Administrativos': currentPeriodData['administrative_expenses'] || 0
    };
    expenses['Total Gastos'] = Object.values(expenses).reduce((sum, val) => sum + Number(val), 0);

    // Calculate summary figures
    const summary = {
      'Utilidad Bruta': revenue['Total Ingresos'] - expenses['Costo de Ventas'],
      'Utilidad Operativa': revenue['Total Ingresos'] - expenses['Costo de Ventas'] - expenses['Gastos Operativos'],
      'Utilidad Neta': revenue['Total Ingresos'] - expenses['Total Gastos']
    };

    return { revenue, expenses, summary };
  };

  const reportDataFormatted = prepareData();

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Calculate percentage change if we have comparison data
  const calculateChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return change.toFixed(2) + '%';
  };

  // Format the date range for display
  const getDateRangeText = () => {
    if (!reportData?.currentPeriod) return "";

    const startDate = new Date(reportData.currentPeriod.startDate);
    const endDate = new Date(reportData.currentPeriod.endDate);
    
    return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
  };

  // Handle export to Excel/PDF
  const handleExport = () => {
    // Implement export functionality
    alert("Export functionality will be implemented soon");
  };

  // Function to get previous period value if comparing
  const getPreviousValue = (section: string, item: string) => {
    if (!reportData?.previousPeriod) return 0;
    
    const prevData = reportData.previousPeriod.data;
    let value = 0;
    
    if (section === 'revenue') {
      if (item === 'Total Ingresos') {
        value = (prevData['revenue'] || 0) + (prevData['service_revenue'] || 0);
      } else if (item === 'Ventas') {
        value = prevData['revenue'] || 0;
      } else if (item === 'Servicios') {
        value = prevData['service_revenue'] || 0;
      }
    } else if (section === 'expenses') {
      if (item === 'Total Gastos') {
        value = (prevData['cost_of_sales'] || 0) + 
                (prevData['operating_expenses'] || 0) + 
                (prevData['administrative_expenses'] || 0);
      } else if (item === 'Costo de Ventas') {
        value = prevData['cost_of_sales'] || 0;
      } else if (item === 'Gastos Operativos') {
        value = prevData['operating_expenses'] || 0;
      } else if (item === 'Gastos Administrativos') {
        value = prevData['administrative_expenses'] || 0;
      }
    } else if (section === 'summary') {
      // Recalculate summary values for previous period
      const prevRevenue = (prevData['revenue'] || 0) + (prevData['service_revenue'] || 0);
      const prevCostOfSales = prevData['cost_of_sales'] || 0;
      const prevOpEx = prevData['operating_expenses'] || 0;
      const prevAdminEx = prevData['administrative_expenses'] || 0;
      const prevTotalExpenses = prevCostOfSales + prevOpEx + prevAdminEx;
      
      if (item === 'Utilidad Bruta') {
        value = prevRevenue - prevCostOfSales;
      } else if (item === 'Utilidad Operativa') {
        value = prevRevenue - prevCostOfSales - prevOpEx;
      } else if (item === 'Utilidad Neta') {
        value = prevRevenue - prevTotalExpenses;
      }
    }
    
    return value;
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
          {/* Revenue Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              INGRESOS
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.revenue).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('revenue', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
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

          {/* Expenses Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              GASTOS
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.expenses).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('expenses', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
            // For expenses, higher values are negative
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
                        {isNegativeChange ? "+" : ""}{changePercent}
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
              RESULTADOS
            </TableCell>
          </TableRow>
          
          {Object.entries(reportDataFormatted.summary).map(([item, amount]) => {
            const previousAmount = compareWithPreviousYear ? getPreviousValue('summary', item) : undefined;
            const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
            const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
            
            return (
              <TableRow key={item}>
                <TableCell className="font-medium">{item}</TableCell>
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
