
import React from "react";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { DateRange } from "react-day-picker";

interface DashboardMetrics {
  chartData?: Array<{
    date: string;
    sales: number;
    adSpend?: number;
  }>;
  [key: string]: any;
}

interface SalesSectionProps {
  metrics: DashboardMetrics;
}

export const SalesSection = ({ metrics }: SalesSectionProps) => {
  return <ChartSection chartData={metrics.chartData || []} />;
};
