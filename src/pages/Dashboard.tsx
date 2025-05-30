
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { MetricsGroupsSection } from "@/components/dashboard/MetricsGroupsSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { PermissionsDebugPanel } from "@/components/debug/PermissionsDebugPanel";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { 
    metrics, 
    loading 
  } = useDashboardMetrics(dateRange);

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <DashboardHeader 
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <MainMetricsSection 
        metrics={metrics}
      />
      <MetricsGroupsSection 
        metrics={metrics}
      />
      <ChartSection 
        chartData={metrics.chartData}
      />
      <PermissionsDebugPanel />
    </div>
  );
}
