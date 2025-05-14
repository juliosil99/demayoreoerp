
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesVsAdSpendChart } from "@/components/dashboard/SalesVsAdSpendChart";

interface ChartDataPoint {
  date: string;
  sales: number;
  adSpend?: number;
}

interface ChartSectionProps {
  chartData: ChartDataPoint[];
}

export const ChartSection = ({ chartData }: ChartSectionProps) => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <SalesVsAdSpendChart data={chartData} />
      </CardContent>
    </Card>
  );
};
