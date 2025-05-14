
import React, { useState } from "react";
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesVsAdSpendChart } from "@/components/dashboard/SalesVsAdSpendChart";
import { formatCurrency } from "@/utils/formatters";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { MetricGroup } from "@/components/dashboard/MetricGroup";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { metrics, loading } = useDashboardMetrics(dateRange);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Contribution Margin</h1>
          <p className="text-muted-foreground text-sm">
            Revenue minus all variable costs, including advertising spend
          </p>
        </div>
        <DatePickerWithRange
          date={dateRange}
          setDate={setDateRange}
          className="w-full md:w-auto"
        />
      </div>

      {/* Main Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          title="Order Revenue"
          value={formatCurrency(metrics.orderRevenue || 0)}
          icon={DollarSign}
          change={metrics.revenueChange}
          changeLabel={metrics.revenueChange > 0 ? "increase" : "decrease"}
          changeType={metrics.revenueChange > 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="Ad Spend"
          value={formatCurrency(metrics.adSpend || 0)}
          icon={DollarSign}
          change={metrics.adSpendChange}
          changeLabel={metrics.adSpendChange > 0 ? "increase" : "decrease"}
          changeType={metrics.adSpendChange < 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="MER"
          value={metrics.mer?.toFixed(2) || "0"}
          icon={TrendingUp}
          change={metrics.merChange}
          changeLabel={metrics.merChange > 0 ? "increase" : "decrease"}
          changeType={metrics.merChange > 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="AOV"
          value={formatCurrency(metrics.aov || 0)}
          icon={ShoppingBag}
          change={metrics.aovChange}
          changeLabel={metrics.aovChange > 0 ? "increase" : "decrease"}
          changeType={metrics.aovChange > 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="Orders"
          value={metrics.orders?.toString() || "0"}
          icon={ShoppingBag}
          change={metrics.ordersChange}
          changeLabel={metrics.ordersChange > 0 ? "increase" : "decrease"}
          changeType={metrics.ordersChange > 0 ? "positive" : "negative"}
        />
      </div>

      {/* Chart Section */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Sales vs Ad Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesVsAdSpendChart data={metrics.chartData || []} />
        </CardContent>
      </Card>
      
      {/* Metrics Groups */}
      <div className="space-y-6">
        {/* Returning Metrics */}
        <MetricGroup
          title="Returning"
          metrics={[
            {
              title: "Revenue",
              value: formatCurrency(metrics.returningRevenue || 0),
              change: metrics.returningRevenueChange,
              changeType: metrics.returningRevenueChange > 0 ? "positive" : "negative"
            },
            {
              title: "Orders",
              value: metrics.returningOrders?.toString() || "0",
              change: metrics.returningOrdersChange,
              changeType: metrics.returningOrdersChange > 0 ? "positive" : "negative"
            },
            {
              title: "AOV",
              value: formatCurrency(metrics.returningAOV || 0),
              change: metrics.returningAOVChange,
              changeType: metrics.returningAOVChange > 0 ? "positive" : "negative"
            },
            {
              title: "Repeat Rate",
              value: `${metrics.repeatRate?.toFixed(2) || "0"}%`,
              change: metrics.repeatRateChange,
              changeType: metrics.repeatRateChange > 0 ? "positive" : "negative"
            }
          ]}
        />
        
        {/* New Customer Metrics */}
        <MetricGroup
          title="New Customer"
          metrics={[
            {
              title: "Revenue",
              value: formatCurrency(metrics.newCustomerRevenue || 0),
              change: metrics.newCustomerRevenueChange,
              changeType: metrics.newCustomerRevenueChange > 0 ? "positive" : "negative"
            },
            {
              title: "Orders",
              value: metrics.newCustomerOrders?.toString() || "0",
              change: metrics.newCustomerOrdersChange,
              changeType: metrics.newCustomerOrdersChange > 0 ? "positive" : "negative"
            },
            {
              title: "AOV",
              value: formatCurrency(metrics.newCustomerAOV || 0),
              change: metrics.newCustomerAOVChange,
              changeType: metrics.newCustomerAOVChange > 0 ? "positive" : "negative"
            },
            {
              title: "CAC",
              value: formatCurrency(metrics.cac || 0),
              change: metrics.cacChange,
              changeType: metrics.cacChange < 0 ? "positive" : "negative"
            }
          ]}
        />
        
        {/* Paid Performance Metrics */}
        <MetricGroup
          title="Paid Performance"
          metrics={[
            {
              title: "Revenue",
              value: formatCurrency(metrics.paidRevenue || 0),
              change: metrics.paidRevenueChange,
              changeType: metrics.paidRevenueChange > 0 ? "positive" : "negative"
            },
            {
              title: "Orders",
              value: metrics.paidOrders?.toString() || "0",
              change: metrics.paidOrdersChange,
              changeType: metrics.paidOrdersChange > 0 ? "positive" : "negative"
            },
            {
              title: "AOV",
              value: formatCurrency(metrics.paidAOV || 0),
              change: metrics.paidAOVChange,
              changeType: metrics.paidAOVChange > 0 ? "positive" : "negative"
            },
            {
              title: "CAC",
              value: formatCurrency(metrics.paidCAC || 0),
              change: metrics.paidCACChange,
              changeType: metrics.paidCACChange < 0 ? "positive" : "negative"
            },
            {
              title: "PAMER",
              value: metrics.pamer?.toFixed(2) || "0",
              change: metrics.pamerChange,
              changeType: metrics.pamerChange > 0 ? "positive" : "negative"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
