
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
  [key: string]: any;
}

interface MetricsGroupsSectionProps {
  metrics: DashboardMetrics;
}

export const MetricsGroupsSection = ({ metrics }: MetricsGroupsSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Returning Metrics */}
      <MetricGroup
        title="Clientes Recurrentes"
        metrics={[
          {
            title: "Ingresos",
            value: formatCurrency(metrics.returningRevenue || 0),
            change: metrics.returningRevenueChange,
            changeType: metrics.returningRevenueChange > 0 ? "positive" : "negative"
          },
          {
            title: "Órdenes",
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
            title: "Tasa de Repetición",
            value: `${metrics.repeatRate?.toFixed(2) || "0"}%`,
            change: metrics.repeatRateChange,
            changeType: metrics.repeatRateChange > 0 ? "positive" : "negative"
          }
        ]}
      />
      
      {/* New Customer Metrics */}
      <MetricGroup
        title="Nuevos Clientes"
        metrics={[
          {
            title: "Ingresos",
            value: formatCurrency(metrics.newCustomerRevenue || 0),
            change: metrics.newCustomerRevenueChange,
            changeType: metrics.newCustomerRevenueChange > 0 ? "positive" : "negative"
          },
          {
            title: "Órdenes",
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
        title="Rendimiento Pagado"
        metrics={[
          {
            title: "Ingresos",
            value: formatCurrency(metrics.paidRevenue || 0),
            change: metrics.paidRevenueChange,
            changeType: metrics.paidRevenueChange > 0 ? "positive" : "negative"
          },
          {
            title: "Órdenes",
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
  );
};
