
import React from "react";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrency } from "@/utils/formatters";

interface DashboardMetrics {
  orderRevenue: number;
  adSpend: number;
  mer: number;
  aov: number;
  orders: number;
  revenueChange: number;
  adSpendChange: number;
  merChange: number;
  aovChange: number;
  ordersChange: number;
  contributionMargin: number;
  marginPercentage: number;
  marginPercentageChange: number;
  [key: string]: any;
}

interface MainMetricsSectionProps {
  metrics: DashboardMetrics;
}

export const MainMetricsSection = ({ metrics }: MainMetricsSectionProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        title="Ingresos por Órdenes"
        value={formatCurrency(metrics.orderRevenue || 0)}
        icon={DollarSign}
        change={metrics.revenueChange}
        changeLabel={metrics.revenueChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.revenueChange > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Sales Velocity"
        value="-"
        icon={TrendingUp}
        // We're removing the change indicators since we don't have data yet
      />
      <MetricCard
        title="Margen porcentual"
        value={`${(metrics.marginPercentage || 0).toFixed(2)}%`}
        icon={TrendingUp}
        change={metrics.marginPercentageChange}
        changeLabel={metrics.marginPercentageChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.marginPercentageChange > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Valor Promedio (AOV)"
        value={formatCurrency(metrics.aov || 0)}
        icon={ShoppingBag}
        change={metrics.aovChange}
        changeLabel={metrics.aovChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.aovChange > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Órdenes Únicas"
        value={metrics.orders?.toString() || "0"}
        icon={ShoppingBag}
        change={metrics.ordersChange}
        changeLabel={metrics.ordersChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.ordersChange > 0 ? "positive" : "negative"}
      />
    </div>
  );
};
