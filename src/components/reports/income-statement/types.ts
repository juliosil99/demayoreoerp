
import { ReportData } from "@/types/financial-reporting";

export interface FormattedReportData {
  revenue: Record<string, number>;
  expenses: Record<string, number>;
  summary: Record<string, number>;
}

export interface IncomeStatementProps {
  userId?: string;
  periodId: string;
  periodType: 'day' | 'month' | 'quarter' | 'year';
  compareWithPreviousYear?: boolean;
}

export interface ReportSectionProps {
  sectionTitle: string;
  sectionData: Record<string, number>;
  compareWithPreviousYear: boolean;
  getPreviousValue: (section: string, item: string) => number;
  formatCurrency: (amount: number) => string;
}

export interface DateRangeInfoProps {
  reportData?: ReportData;
  onExport: () => void;
}
