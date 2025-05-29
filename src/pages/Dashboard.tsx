
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { MetricsGroupsSection } from "@/components/dashboard/MetricsGroupsSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { PermissionsDebugPanel } from "@/components/debug/PermissionsDebugPanel";

export default function Dashboard() {
  const { 
    combinedData, 
    salesData, 
    metricsData, 
    isLoading, 
    error 
  } = useDashboardMetrics();

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
      <DashboardHeader />
      <MainMetricsSection 
        data={combinedData}
        salesData={salesData}
        metricsData={metricsData}
      />
      <MetricsGroupsSection />
      <ChartSection />
      <PermissionsDebugPanel />
    </div>
  );
}
