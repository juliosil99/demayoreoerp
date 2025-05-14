
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { useChannelDistributionData } from "./useChannelDistributionData";
import { ChannelPieChart } from "./ChannelPieChart";
import { LoadingState, ErrorState, EmptyState } from "./ChannelChartStates";
import { calculateTotalValue } from "./utils";

export const SalesChannelDistribution = () => {
  const { data: channelDistribution, isLoading, error } = useChannelDistributionData();

  if (isLoading) {
    return <LoadingState title="Distribución de Ventas por Canal" />;
  }

  if (error) {
    console.error("Error loading channel distribution data:", error);
    return <ErrorState title="Distribución de Ventas por Canal" />;
  }

  if (!channelDistribution || channelDistribution.length === 0) {
    return <EmptyState title="Distribución de Ventas por Canal" />;
  }

  // Calculate the total value for the summary display
  const totalValue = calculateTotalValue(channelDistribution);

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución de Ventas por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ChannelPieChart channelDistribution={channelDistribution} />
          <div className="mt-2 text-sm text-center font-medium">
            Total: {formatCurrency(totalValue)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
