
import { DateRange } from "react-day-picker";
import { DashboardMetrics, ChannelMetrics, ChartDataPoint } from "@/types/dashboard";

export interface MetricsCalculator {
  calculatePercentChange: (current: number, previous: number) => number;
  calculateChanges: (current: any, previous: any | null) => any;
}

export interface SalesDataFetcher {
  fetchSalesMetrics: (dateRange: DateRange) => Promise<DashboardMetrics>;
  isLoading: boolean;
}

export interface SQLResultProcessor {
  processChannelMetrics: (currentChannelData: any[], dateRange: DateRange) => Promise<ChannelMetrics[]>;
  generateChartDataFromSQL: (sqlResults: any[]) => ChartDataPoint[];
  getEmptyMetrics: () => DashboardMetrics;
}
