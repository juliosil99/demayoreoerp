
import React from "react";
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
  // For now, we'll use dummy data while implementing the real report functionality
  const isLoading = false;
  const error = null;

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

  // For demo purposes, create some sample data
  const dummyReportData = {
    assets: {
      'Activo Circulante': {
        'Efectivo': 150000,
        'Cuentas por Cobrar': 75000,
        'Inventario': 125000,
        'Total Activo Circulante': 350000
      },
      'Activo Fijo': {
        'Propiedades': 500000,
        'Equipo': 200000,
        'Depreciación Acumulada': -100000,
        'Total Activo Fijo': 600000
      },
      'Total Activos': 950000
    },
    liabilities: {
      'Pasivo Circulante': {
        'Cuentas por Pagar': 80000,
        'Préstamos a Corto Plazo': 50000,
        'Total Pasivo Circulante': 130000
      },
      'Pasivo a Largo Plazo': {
        'Préstamos Bancarios': 300000,
        'Hipotecas': 150000,
        'Total Pasivo a Largo Plazo': 450000
      },
      'Total Pasivos': 580000
    },
    equity: {
      'Capital Social': 200000,
      'Utilidades Retenidas': 125000,
      'Utilidad del Ejercicio': 45000,
      'Total Capital Contable': 370000
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
          <h3 className="font-medium text-sm text-gray-500">Fecha:</h3>
          <p className="font-medium">{format(new Date(), 'dd/MM/yyyy')}</p>
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
          {/* Assets Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVOS
            </TableCell>
          </TableRow>
          
          {/* Current Assets */}
          {Object.entries(dummyReportData.assets['Activo Circulante']).map(([item, amount]) => (
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
                    <span className="text-green-600">+11.11%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Fixed Assets */}
          {Object.entries(dummyReportData.assets['Activo Fijo']).map(([item, amount]) => (
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
                    {formatCurrency(amount * 0.95)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">+5.26%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Total Assets */}
          <TableRow>
            <TableCell className="font-bold">TOTAL ACTIVOS</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(dummyReportData.assets['Total Activos'])}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency(dummyReportData.assets['Total Activos'] * 0.92)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600">+8.70%</span>
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
          {Object.entries(dummyReportData.liabilities['Pasivo Circulante']).map(([item, amount]) => (
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
                    {formatCurrency(amount * 1.1)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">-9.09%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Long-term Liabilities */}
          {Object.entries(dummyReportData.liabilities['Pasivo a Largo Plazo']).map(([item, amount]) => (
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
                    {formatCurrency(amount * 1.05)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">-4.76%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Total Liabilities */}
          <TableRow>
            <TableCell className="font-bold">TOTAL PASIVOS</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(dummyReportData.liabilities['Total Pasivos'])}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency(dummyReportData.liabilities['Total Pasivos'] * 1.07)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600">-6.54%</span>
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
          {Object.entries(dummyReportData.equity).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className={item.includes('Total') ? "font-bold" : item === 'Utilidad del Ejercicio' ? "font-medium" : "pl-6"}>
                {item}
              </TableCell>
              <TableCell className={`text-right ${item.includes('Total') ? "font-bold" : item === 'Utilidad del Ejercicio' ? "font-medium" : ""}`}>
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className={`text-right ${item.includes('Total') ? "font-bold" : item === 'Utilidad del Ejercicio' ? "font-medium" : ""}`}>
                    {formatCurrency(amount * 0.85)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">+17.65%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Liabilities + Equity Total */}
          <TableRow className="border-t-2 border-gray-200">
            <TableCell className="font-bold">TOTAL PASIVO + CAPITAL</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(dummyReportData.liabilities['Total Pasivos'] + dummyReportData.equity['Total Capital Contable'])}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right font-bold">
                  {formatCurrency((dummyReportData.liabilities['Total Pasivos'] * 1.07) + (dummyReportData.equity['Total Capital Contable'] * 0.85))}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600">+2.04%</span>
                </TableCell>
              </>
            )}
          </TableRow>
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Nota: Este reporte es preliminar. Los datos aquí mostrados son de muestra mientras implementamos la funcionalidad completa.</p>
      </div>
    </div>
  );
};
