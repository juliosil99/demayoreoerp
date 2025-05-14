
import React, { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { MetricsGroupsSection } from "@/components/dashboard/MetricsGroupsSection";
import { ContributionMarginCard } from "@/components/dashboard/ContributionMarginCard";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { metrics, loading } = useDashboardMetrics(dateRange);

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <DashboardHeader dateRange={dateRange} setDateRange={setDateRange} />

      {/* Contribution Margin Card */}
      <ContributionMarginCard contributionMargin={metrics.contributionMargin} />

      {/* Main Metrics Cards */}
      <MainMetricsSection metrics={metrics} />

      {/* Chart Section */}
      <ChartSection chartData={metrics.chartData || []} />
      
      {/* Metrics Groups */}
      <MetricsGroupsSection metrics={metrics} />
    </div>
  );
};

export default Dashboard;
