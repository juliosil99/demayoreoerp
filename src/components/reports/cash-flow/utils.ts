
import { ReportData } from "@/types/financial-reporting";
import { FormattedFlowData } from "./types";

/**
 * Formats currency values for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

/**
 * Prepares and formats cash flow data for display
 */
export const prepareFlowData = (reportData?: ReportData): FormattedFlowData => {
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

/**
 * Calculates percentage change between current and previous values
 */
export const calculateChange = (current: number, previous?: number): string | null => {
  if (previous === undefined || previous === 0) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return change.toFixed(2) + '%';
};
