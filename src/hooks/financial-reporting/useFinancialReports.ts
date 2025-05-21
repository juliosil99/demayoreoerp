
import { useReportData } from "./queries/useReportData";
import { FinancialReportOptions } from "@/types/financial-reporting";

/**
 * Hook for financial reporting functionality
 */
export function useFinancialReports(
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow',
  options: FinancialReportOptions
) {
  const { data: reportData, isLoading, error } = useReportData(reportType, options);

  return {
    reportData,
    isLoading,
    error
  };
}
