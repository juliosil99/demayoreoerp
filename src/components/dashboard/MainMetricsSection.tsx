
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
        title="Gasto Publicitario"
        value={formatCurrency(metrics.adSpend || 0)}
        icon={DollarSign}
        change={metrics.adSpendChange}
        changeLabel={metrics.adSpendChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.adSpendChange < 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="MER"
        value={metrics.mer?.toFixed(2) || "0"}
        icon={TrendingUp}
        change={metrics.merChange}
        changeLabel={metrics.merChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.merChange > 0 ? "positive" : "negative"}
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
        title="Órdenes"
        value={metrics.orders?.toString() || "0"}
        icon={ShoppingBag}
        change={metrics.ordersChange}
        changeLabel={metrics.ordersChange > 0 ? "incremento" : "disminución"}
        changeType={metrics.ordersChange > 0 ? "positive" : "negative"}
      />
    </div>
  );
};
