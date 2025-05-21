
import { ReportData } from "@/types/financial-reporting";

export interface CashFlowProps {
  userId?: string;
  periodId: string;
  periodType: 'day' | 'month' | 'quarter' | 'year';
  compareWithPreviousYear?: boolean;
}

export interface FormattedFlowData {
  operating: Record<string, number>;
  investing: Record<string, number>;
  financing: Record<string, number>;
  summary: Record<string, number>;
}

export interface SectionProps {
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
