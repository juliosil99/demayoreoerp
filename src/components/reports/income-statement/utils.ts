
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

export const getPreviousValueHelper = (reportData: ReportData | undefined, section: string, item: string): number => {
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
