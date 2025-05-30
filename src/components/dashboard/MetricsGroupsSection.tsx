
import React from "react";
import { MetricGroup } from "@/components/dashboard/MetricGroup";
import { formatCurrency } from "@/utils/formatters";

interface DashboardMetrics {
  // Returning customer metrics
  returningRevenue: number;
  returningOrders: number;
  returningAOV: number;
  repeatRate: number;
  returningRevenueChange: number;
  returningOrdersChange: number;
  returningAOVChange: number;
  repeatRateChange: number;
  
  // New customer metrics
  newCustomerRevenue: number;
  newCustomerOrders: number;
  newCustomerAOV: number;
  cac: number;
  newCustomerRevenueChange: number;
  newCustomerOrdersChange: number;
  newCustomerAOVChange: number;
  cacChange: number;
  
  // Paid performance metrics
  paidRevenue: number;
  paidOrders: number;
  paidAOV: number;
  paidCAC: number;
  pamer: number;
  paidRevenueChange: number;
  paidOrdersChange: number;
  paidAOVChange: number;
  paidCACChange: number;
  pamerChange: number;
  
  // For determining if we have real data
  orderRevenue: number;
  orders: number;
  [key: string]: any;
}

interface MetricsGroupsSectionProps {
  metrics: DashboardMetrics;
}

export const MetricsGroupsSection = ({ metrics }: MetricsGroupsSectionProps) => {
  const hasData = metrics.orderRevenue > 0 || metrics.orders > 0;
  
  return (
    <div className="space-y-6">
      {/* Returning Metrics */}
      <MetricGroup
        title="Clientes Recurrentes"
        metrics={[
          {
            title: "Ingresos",
            value: hasData ? formatCurrency(metrics.returningRevenue || 0) : "Sin datos",
            change: hasData ? metrics.returningRevenueChange : undefined,
            changeType: hasData && metrics.returningRevenueChange > 0 ? "positive" : "negative"
          },
          {
            title: "Órdenes",
            value: hasData ? (metrics.returningOrders?.toString() || "0") : "Sin datos",
            change: hasData ? metrics.returningOrdersChange : undefined,
            changeType: hasData && metrics.returningOrdersChange > 0 ? "positive" : "negative"
          },
          {
            title: "AOV",
            value: hasData ? formatCurrency(metrics.returningAOV || 0) : "Sin datos",
            change: hasData ? metrics.returningAOVChange : undefined,
            changeType: hasData && metrics.returningAOVChange > 0 ? "positive" : "negative"
          },
          {
            title: "Tasa de Repetición",
            value: hasData ? `${(metrics.repeatRate || 0).toFixed(2)}%` : "Sin datos",
            change: hasData ? metrics.repeatRateChange : undefined,
            changeType: hasData && metrics.repeatRateChange > 0 ? "positive" : "negative"
          }
        ]}
      />
      
      {/* New Customer Metrics */}
      <MetricGroup
        title="Nuevos Clientes"
        metrics={[
          {
            title: "Ingresos",
            value: hasData ? formatCurrency(metrics.newCustomerRevenue || 0) : "Sin datos",
            change: hasData ? metrics.newCustomerRevenueChange : undefined,
            changeType: hasData && metrics.newCustomerRevenueChange > 0 ? "positive" : "negative"
          },
          {
            title: "Órdenes",
            value: hasData ? (metrics.newCustomerOrders?.toString() || "0") : "Sin datos",
            change: hasData ? metrics.newCustomerOrdersChange : undefined,
            changeType: hasData && metrics.newCustomerOrdersChange > 0 ? "positive" : "negative"
          },
          {
            title: "AOV",
            value: hasData ? formatCurrency(metrics.newCustomerAOV || 0) : "Sin datos",
            change: hasData ? metrics.newCustomerAOVChange : undefined,
            changeType: hasData && metrics.newCustomerAOVChange > 0 ? "positive" : "negative"
          },
          {
            title: "CAC",
            value: "Sin datos de publicidad",
            change: undefined,
            changeType: "neutral"
          }
        ]}
      />
      
      {/* Paid Performance Metrics */}
      <MetricGroup
        title="Rendimiento Pagado"
        metrics={[
          {
            title: "Ingresos",
            value: "Sin datos de publicidad",
            change: undefined,
            changeType: "neutral"
          },
          {
            title: "Órdenes",
            value: "Sin datos de publicidad",
            change: undefined,
            changeType: "neutral"
          },
          {
            title: "AOV",
            value: "Sin datos de publicidad",
            change: undefined,
            changeType: "neutral"
          },
          {
            title: "CAC",
            value: "Sin datos de publicidad",
            change: undefined,
            changeType: "neutral"
          },
          {
            title: "PAMER",
            value: "Sin datos de publicidad",
            change: undefined,
            changeType: "neutral"
          }
        ]}
      />
    </div>
  );
};
