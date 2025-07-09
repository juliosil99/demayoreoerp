
import React from "react";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrency } from "@/utils/formatters";

interface DashboardMetrics {
  orderRevenue?: number;
  adSpend?: number;
  mer?: number;
  aov?: number;
  orders?: number;
  revenueChange?: number;
  adSpendChange?: number;
  merChange?: number;
  aovChange?: number;
  ordersChange?: number;
  contributionMargin?: number;
  contributionMarginChange?: number;
  marginPercentage?: number;
  marginPercentageChange?: number;
  [key: string]: any;
}

interface MainMetricsSectionProps {
  metrics: DashboardMetrics;
}

export const MainMetricsSection = ({ metrics }: MainMetricsSectionProps) => {
  const hasData = (metrics.orderRevenue || 0) > 0 || (metrics.orders || 0) > 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        title="Ingresos por Órdenes"
        value={hasData ? formatCurrency(metrics.orderRevenue || 0) : "Sin datos"}
        icon={DollarSign}
        change={hasData ? metrics.revenueChange : undefined}
        changeLabel={hasData && (metrics.revenueChange || 0) > 0 ? "incremento" : "disminución"}
        changeType={hasData && (metrics.revenueChange || 0) > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Margen de Contribución"
        value={hasData ? formatCurrency(metrics.contributionMargin || 0) : "Sin datos"}
        icon={TrendingUp}
        change={hasData ? metrics.contributionMarginChange : undefined}
        changeLabel={hasData && (metrics.contributionMarginChange || 0) > 0 ? "incremento" : "disminución"}
        changeType={hasData && (metrics.contributionMarginChange || 0) > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Margen porcentual"
        value={hasData ? `${(metrics.marginPercentage || 0).toFixed(2)}%` : "Sin datos"}
        icon={TrendingUp}
        change={hasData ? metrics.marginPercentageChange : undefined}
        changeLabel={hasData && (metrics.marginPercentageChange || 0) > 0 ? "incremento" : "disminución"}
        changeType={hasData && (metrics.marginPercentageChange || 0) > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Valor Promedio (AOV)"
        value={hasData ? formatCurrency(metrics.aov || 0) : "Sin datos"}
        icon={ShoppingBag}
        change={hasData ? metrics.aovChange : undefined}
        changeLabel={hasData && (metrics.aovChange || 0) > 0 ? "incremento" : "disminución"}
        changeType={hasData && (metrics.aovChange || 0) > 0 ? "positive" : "negative"}
      />
      <MetricCard
        title="Órdenes Únicas"
        value={hasData ? (metrics.orders?.toString() || "0") : "Sin datos"}
        icon={ShoppingBag}
        change={hasData ? metrics.ordersChange : undefined}
        changeLabel={hasData && (metrics.ordersChange || 0) > 0 ? "incremento" : "disminución"}
        changeType={hasData && (metrics.ordersChange || 0) > 0 ? "positive" : "negative"}
      />
    </div>
  );
};
