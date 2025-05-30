
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { ContributionMarginCard } from "@/components/dashboard/ContributionMarginCard";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { OldestExpenseCard } from "@/components/dashboard/OldestExpenseCard";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { useOldestExpense } from "@/hooks/dashboard/useOldestExpense";
import { PermissionsDebugPanel } from "@/components/debug/PermissionsDebugPanel";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
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
        <DashboardMetrics 
          data={combinedData}
          salesData={salesData}
          metricsData={metricsData}
        />
        
        <div className="grid gap-4 md:grid-cols-2">
          <ContributionMarginCard 
            contributionMargin={combinedData.contributionMargin}
            contributionMarginChange={combinedData.contributionMarginChange}
          />
          
          <ChartSection 
            chartData={combinedData.chartData}
          />
        </div>
        
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
