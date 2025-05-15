
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
  // For now, we'll use dummy data while implementing the real report functionality
  const [year, setYear] = React.useState<number>(2025);
  const [period, setPeriod] = React.useState<number>(5); // May for 2025

  // Fetch the report data
  const { reportData, isLoading, error } = useFinancialReports('income_statement', {
    periodType,
    year,
    period,
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

  // For demo purposes, create some sample data
  const dummyReportData = {
    revenue: {
      'Ventas': 150000,
      'Servicios': 35000,
      'Total Ingresos': 185000
    },
    expenses: {
      'Costo de Ventas': 75000,
      'Gastos Operativos': 45000,
      'Gastos Administrativos': 20000,
      'Total Gastos': 140000
    },
    summary: {
      'Utilidad Bruta': 110000,
      'Utilidad Operativa': 65000,
      'Utilidad Neta': 45000
    }
  };

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
            <TableHead className="text-right">{periodType === 'month' ? 'Mayo 2025' : 'Actual'}</TableHead>
            {compareWithPreviousYear && (
              <>
                <TableHead className="text-right">{periodType === 'month' ? 'Mayo 2024' : 'Año Anterior'}</TableHead>
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
          
          {Object.entries(dummyReportData.revenue).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className={item.includes('Total') ? "font-medium" : "pl-6"}>
                {item}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className="text-right">
                    {formatCurrency(amount * 0.85)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">+17.65%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}

          {/* Expenses Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              GASTOS
            </TableCell>
          </TableRow>
          
          {Object.entries(dummyReportData.expenses).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className={item.includes('Total') ? "font-medium" : "pl-6"}>
                {item}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className="text-right">
                    {formatCurrency(amount * 0.9)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-red-600">+11.11%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}

          {/* Summary Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              RESULTADOS
            </TableCell>
          </TableRow>
          
          {Object.entries(dummyReportData.summary).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className="font-medium">{item}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(amount * 0.8)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">+25.00%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Nota: Este reporte es preliminar. Los datos aquí mostrados son de muestra mientras implementamos la funcionalidad completa.</p>
      </div>
    </div>
  );
};
