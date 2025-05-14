
import React, { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { ContributionMarginSection } from "@/components/dashboard/sections/ContributionMarginSection";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { MetricsGroupsSection } from "@/components/dashboard/MetricsGroupsSection";
import { StateDistributionSection } from "@/components/dashboard/sections/StateDistributionSection";

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
      <ContributionMarginSection 
        contributionMargin={metrics.contributionMargin} 
        contributionMarginChange={metrics.contributionMarginChange}
      />

      {/* Main Metrics Cards */}
      <MainMetricsSection metrics={metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <ChartSection chartData={metrics.chartData || []} />
        
        {/* State Distribution */}
        <StateDistributionSection />
      </div>
      
      {/* Metrics Groups */}
      <MetricsGroupsSection metrics={metrics} />
    </div>
  );
};

export default Dashboard;
