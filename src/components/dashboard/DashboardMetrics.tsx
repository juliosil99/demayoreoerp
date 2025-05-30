
import React from "react";
import { DollarSign, ShoppingBag, Receipt, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrency } from "@/utils/formatters";

interface DashboardMetrics {
  yesterdaySales: number;
  unreconciled: number;
  receivablesPending: number;
  salesCount: number;
  unreconciledCount: number;
  receivablesCount: number;
  [key: string]: any;
}

interface DashboardMetricsProps {
  data: DashboardMetrics;
  salesData: any;
  metricsData: any;
}

export const DashboardMetrics = ({ data, salesData, metricsData }: DashboardMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Ventas de Ayer"
        value={formatCurrency(data.yesterdaySales || 0)}
        icon={DollarSign}
        count={data.salesCount}
        countLabel="ventas"
      />
      <MetricCard
        title="Sin Conciliar"
        value={formatCurrency(data.unreconciled || 0)}
        icon={ShoppingBag}
        count={data.unreconciledCount}
        countLabel="registros"
      />
      <MetricCard
        title="Por Cobrar Pendientes"
        value={formatCurrency(data.receivablesPending || 0)}
        icon={Receipt}
        count={data.receivablesCount}
        countLabel="facturas"
      />
      <MetricCard
        title="Clientes Activos"
        value="0"
        icon={Users}
        count={0}
        countLabel="clientes"
      />
    </div>
  );
};
