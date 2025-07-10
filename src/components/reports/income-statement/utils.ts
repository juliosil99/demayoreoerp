import { ReportData } from "@/types/financial-reporting";
import { FormattedReportData } from "./types";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const calculateChange = (current: number, previous?: number) => {
  if (previous === undefined || previous === 0) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return change.toFixed(2) + '%';
};

export const prepareReportData = (reportData?: ReportData): FormattedReportData => {
  if (!reportData || !reportData.currentPeriod) {
    return {
      revenue: {
        'Ventas': 0,
        'Servicios': 0,
        'Total Ingresos': 0
      },
      expenses: {
        'Costo de Ventas': 0,
        'Gastos de Comisión': 0,
        'Gastos de Envío': 0,
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
  
  // Extract revenue accounts - use real sales data
  const revenue = {
    'Ventas': currentPeriodData['revenue'] || currentPeriodData['501-Ventas'] || 0,
    'Servicios': currentPeriodData['service_revenue'] || currentPeriodData['502-Servicios'] || 0
  };
  revenue['Total Ingresos'] = Object.values(revenue).reduce((sum, val) => sum + Number(val), 0);

  // Extract expense accounts - use real expense data
  const costOfSales = currentPeriodData['cost_of_sales'] || currentPeriodData['601-Costo de Ventas'] || 0;
  const commissionExpenses = currentPeriodData['commission_expenses'] || currentPeriodData['602-Gastos de Comisión'] || 0;
  const shippingExpenses = currentPeriodData['shipping_expenses'] || currentPeriodData['603-Gastos de Envío'] || 0;
  const adminExpenses = currentPeriodData['expense'] || 0; // From real expenses table
  
  const expenses = {
    'Costo de Ventas': costOfSales,
    'Gastos de Comisión': commissionExpenses,
    'Gastos de Envío': shippingExpenses,
    'Gastos Administrativos': adminExpenses
  };
  expenses['Total Gastos'] = Object.values(expenses).reduce((sum, val) => sum + Number(val), 0);

  // Calculate summary figures
  const summary = {
    'Utilidad Bruta': revenue['Total Ingresos'] - expenses['Costo de Ventas'],
    'Utilidad Operativa': revenue['Total Ingresos'] - expenses['Costo de Ventas'] - expenses['Gastos de Comisión'] - expenses['Gastos de Envío'],
    'Utilidad Neta': revenue['Total Ingresos'] - expenses['Total Gastos']
  };

  return { revenue, expenses, summary };
};

export const getPreviousValueHelper = (reportData: ReportData | undefined, section: string, item: string): number => {
  if (!reportData?.previousPeriod) return 0;
  
  const prevData = reportData.previousPeriod.data;
  let value = 0;
  
  if (section === 'revenue') {
    if (item === 'Total Ingresos') {
      value = (prevData['revenue'] || prevData['501-Ventas'] || 0) + (prevData['service_revenue'] || prevData['502-Servicios'] || 0);
    } else if (item === 'Ventas') {
      value = prevData['revenue'] || prevData['501-Ventas'] || 0;
    } else if (item === 'Servicios') {
      value = prevData['service_revenue'] || prevData['502-Servicios'] || 0;
    }
  } else if (section === 'expenses') {
    const prevCostOfSales = prevData['cost_of_sales'] || prevData['601-Costo de Ventas'] || 0;
    const prevCommissions = prevData['commission_expenses'] || prevData['602-Gastos de Comisión'] || 0;
    const prevShipping = prevData['shipping_expenses'] || prevData['603-Gastos de Envío'] || 0;
    const prevAdmin = prevData['expense'] || 0;
    
    if (item === 'Total Gastos') {
      value = prevCostOfSales + prevCommissions + prevShipping + prevAdmin;
    } else if (item === 'Costo de Ventas') {
      value = prevCostOfSales;
    } else if (item === 'Gastos de Comisión') {
      value = prevCommissions;
    } else if (item === 'Gastos de Envío') {
      value = prevShipping;
    } else if (item === 'Gastos Administrativos') {
      value = prevAdmin;
    }
  } else if (section === 'summary') {
    // Recalculate summary values for previous period using real data
    const prevRevenue = (prevData['revenue'] || prevData['501-Ventas'] || 0) + (prevData['service_revenue'] || prevData['502-Servicios'] || 0);
    const prevCostOfSales = prevData['cost_of_sales'] || prevData['601-Costo de Ventas'] || 0;
    const prevCommissions = prevData['commission_expenses'] || prevData['602-Gastos de Comisión'] || 0;
    const prevShipping = prevData['shipping_expenses'] || prevData['603-Gastos de Envío'] || 0;
    const prevAdmin = prevData['expense'] || 0;
    const prevTotalExpenses = prevCostOfSales + prevCommissions + prevShipping + prevAdmin;
    
    if (item === 'Utilidad Bruta') {
      value = prevRevenue - prevCostOfSales;
    } else if (item === 'Utilidad Operativa') {
      value = prevRevenue - prevCostOfSales - prevCommissions - prevShipping;
    } else if (item === 'Utilidad Neta') {
      value = prevRevenue - prevTotalExpenses;
    }
  }
  
  return value;
};