
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
    combinedData, 
    salesData, 
    metricsData, 
    isLoading, 
    error 
  } = useDashboardMetrics(dateRange);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error al cargar el dashboard</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <DashboardHeader 
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <MainMetricsSection 
        metrics={combinedData}
      />
      <MetricsGroupsSection 
        metrics={combinedData}
      />
      <ChartSection 
        chartData={combinedData.chartData}
      />
      <PermissionsDebugPanel />
    </div>
  );
}
