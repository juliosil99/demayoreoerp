
import { Building, CreditCard, BanknoteIcon, ReceiptIcon } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { useOldestExpense } from "@/hooks/dashboard/useOldestExpense";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { OldestExpenseCard } from "@/components/dashboard/OldestExpenseCard";
import { formatCurrency, formatDate } from "@/utils/formatters";

const Dashboard = () => {
  const { metrics, loading } = useDashboardMetrics();
  const oldestExpense = useOldestExpense([]);

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
          icon={BanknoteIcon}
        />
        <MetricCard
          title="Gastos por Conciliar"
          value={formatCurrency(metrics.unreconciled)}
          icon={ReceiptIcon}
        />
        <MetricCard
          title="Cuentas por Cobrar"
          value={formatCurrency(metrics.receivablesPending)}
          icon={CreditCard}
        />
      </div>

      <OldestExpenseCard
        expense={oldestExpense}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Dashboard;
