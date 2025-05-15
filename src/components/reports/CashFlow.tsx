
import React from "react";
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
          No se pudo cargar el flujo de efectivo. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // For demo purposes, create some sample data
  const dummyReportData = {
    operating: {
      'Utilidad Neta': 45000,
      'Depreciación y Amortización': 15000,
      'Cambios en Cuentas por Cobrar': -25000,
      'Cambios en Inventario': -10000,
      'Cambios en Cuentas por Pagar': 12000,
      'Flujo Neto de Actividades Operativas': 37000
    },
    investing: {
      'Compra de Activos Fijos': -45000,
      'Venta de Activos': 15000,
      'Inversiones Financieras': -5000,
      'Flujo Neto de Actividades de Inversión': -35000
    },
    financing: {
      'Préstamos Recibidos': 60000,
      'Pagos de Préstamos': -25000,
      'Dividendos Pagados': -15000,
      'Flujo Neto de Actividades de Financiamiento': 20000
    },
    summary: {
      'Incremento Neto en Efectivo': 22000,
      'Efectivo al Inicio del Período': 128000,
      'Efectivo al Final del Período': 150000
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
          <h3 className="font-medium text-sm text-gray-500">Período:</h3>
          <p className="font-medium">
            {periodType === 'month' ? 'Mayo 2025' : periodType === 'quarter' ? 'Q2 2025' : periodType === 'year' ? '2025' : format(new Date(), 'dd/MM/yyyy')}
          </p>
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
          {/* Operating Activities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVIDADES OPERATIVAS
            </TableCell>
          </TableRow>
          
          {Object.entries(dummyReportData.operating).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
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
          
          {/* Investing Activities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVIDADES DE INVERSIÓN
            </TableCell>
          </TableRow>
          
          {Object.entries(dummyReportData.investing).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
                {item}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className="text-right">
                    {formatCurrency(amount * 1.2)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">-16.67%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Financing Activities Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              ACTIVIDADES DE FINANCIAMIENTO
            </TableCell>
          </TableRow>
          
          {Object.entries(dummyReportData.financing).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
                {item}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className="text-right">
                    {formatCurrency(amount * 0.8)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">+25.00%</span> {/* Dummy change */}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          
          {/* Summary Section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
              RESUMEN
            </TableCell>
          </TableRow>
          
          {Object.entries(dummyReportData.summary).map(([item, amount]) => (
            <TableRow key={item}>
              <TableCell className="font-medium">
                {item}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(amount)}
              </TableCell>
              {compareWithPreviousYear && (
                <>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(amount * 0.85)} {/* Dummy previous year data */}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">+17.65%</span> {/* Dummy change */}
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
