
import React from "react";
import { useFinancialReports } from "@/hooks/financial-reporting/useFinancialReports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowProps } from "./types";
import { DateRangeInfo } from "./components/DateRangeInfo";
import { NoDataMessage } from "./components/NoDataMessage";
import { CashFlowTable } from "./components/CashFlowTable";
import { prepareFlowData } from "./utils";

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
          No se pudo cargar el flujo de efectivo. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  const reportDataFormatted = prepareFlowData(reportData);

  // Handle export to Excel/PDF
  const handleExport = () => {
    alert("Export functionality will be implemented soon");
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

  const hasData = reportData && Object.keys(reportData.currentPeriod?.data || {}).length > 0;

  return (
    <div>
      <DateRangeInfo reportData={reportData} onExport={handleExport} />
      <CashFlowTable 
        flowData={reportDataFormatted}
        compareWithPreviousYear={compareWithPreviousYear}
        getPreviousValue={getPreviousValue}
      />
      <NoDataMessage hasData={hasData} />
    </div>
  );
};
