import { Building, CreditCard, BanknoteIcon, ReceiptIcon, ShoppingCart } from "lucide-react";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { MetricCard } from "./MetricCard";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { metrics, loading } = useDashboardMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Panel de Control</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Ventas de Ayer"
          value={formatCurrency(metrics.yesterdaySales)}
          icon={ShoppingCart}
          count={metrics.salesCount}
          countLabel="ventas pendientes"
        />
        <MetricCard
          title="Gastos por Conciliar"
          value={formatCurrency(metrics.unreconciled)}
          icon={ReceiptIcon}
          count={metrics.unreconciledCount}
          countLabel="gastos sin conciliar"
        />
        <MetricCard
          title="Cuentas por Cobrar"
          value={formatCurrency(metrics.receivablesPending)}
          icon={CreditCard}
          count={metrics.receivablesCount}
          countLabel="cuentas pendientes"
        />
      </div>
    </div>
  );
};

export default Dashboard;
