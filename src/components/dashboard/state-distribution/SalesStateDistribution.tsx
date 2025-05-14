
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { useStateDistributionData } from "./useStateDistributionData";
import { StatePieChart } from "./StatePieChart";
import { LoadingState, ErrorState, EmptyState } from "./StateChartStates";
import { calculateTotalValue } from "./utils";
import { DateRange } from "react-day-picker";

interface SalesStateDistributionProps {
  dateRange?: DateRange;
}

export const SalesStateDistribution = ({ dateRange }: SalesStateDistributionProps) => {
  const { data: stateDistribution, isLoading, error } = useStateDistributionData(dateRange);

  if (isLoading) {
    return <LoadingState title="Distribución de Ventas por Estado" />;
  }

  if (error) {
    console.error("Error loading sales distribution data:", error);
    return <ErrorState title="Distribución de Ventas por Estado" />;
  }

  if (!stateDistribution || stateDistribution.length === 0) {
    return <EmptyState title="Distribución de Ventas por Estado" />;
  }

  // Calculate the total value for the summary display
  const totalValue = calculateTotalValue(stateDistribution);

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución de Ventas por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <StatePieChart stateDistribution={stateDistribution} />
          <div className="mt-2 text-sm text-center font-medium">
            Total: {formatCurrency(totalValue)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
