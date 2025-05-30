import React, { useState } from "react";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { MetricsGroupsSection } from "@/components/dashboard/MetricsGroupsSection";
import { ContributionMarginSection } from "@/components/dashboard/sections/ContributionMarginSection";
import { SalesSection } from "@/components/dashboard/sections/SalesSection";
import { ChannelDistributionSection } from "@/components/dashboard/sections/ChannelDistributionSection";
import { StateDistributionSection } from "@/components/dashboard/sections/StateDistributionSection";
import { ChannelMetricsSection } from "@/components/dashboard/sections/ChannelMetricsSection";
import { SkuChannelSearchBox } from "@/components/dashboard/sections/SkuChannelSearchBox";
import { TopSkusByUnitsSection } from "@/components/dashboard/sections/TopSkusByUnitsSection";
import { OldestExpenseCard } from "@/components/dashboard/OldestExpenseCard";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { useOldestExpense } from "@/hooks/dashboard/useOldestExpense";
import { PermissionsDebugPanel } from "@/components/debug/PermissionsDebugPanel";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function Dashboard() {
  // Set default date range to last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  const { 
    combinedData, 
    salesData, 
    metricsData, 
    isLoading, 
    error 
  } = useDashboardMetrics(dateRange);

  const { oldestExpense, isLoading: expenseLoading } = useOldestExpense();

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
      
      <div className="space-y-6">
        {/* Contribution Margin Section */}
        <ContributionMarginSection 
          contributionMargin={combinedData.contributionMargin}
          contributionMarginChange={combinedData.contributionMarginChange}
        />
        
        {/* Main Metrics Section */}
        <MainMetricsSection metrics={combinedData} />
        
        {/* Sales Chart Section */}
        <SalesSection metrics={combinedData} />
        
        {/* Distribution Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <StateDistributionSection dateRange={dateRange} />
          <ChannelDistributionSection dateRange={dateRange} />
        </div>
        
        {/* Channel Metrics Section */}
        <ChannelMetricsSection channelMetrics={combinedData.channelMetrics} />
        
        {/* SKU Search Box */}
        <SkuChannelSearchBox dateRange={dateRange} />
        
        {/* Top SKUs Section */}
        <TopSkusByUnitsSection dateRange={dateRange} />
        
        {/* Metrics Groups Section */}
        <MetricsGroupsSection metrics={combinedData} />
        
        {/* Oldest Expense Card */}
        {!expenseLoading && oldestExpense && (
          <OldestExpenseCard 
            expense={oldestExpense}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
      
      <PermissionsDebugPanel />
    </div>
  );
}
