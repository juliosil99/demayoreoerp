
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  sales: number;
  adSpend: number;
  target?: number;
}

interface SalesVsAdSpendChartProps {
  data: ChartDataPoint[];
}

export const SalesVsAdSpendChart = ({ data }: SalesVsAdSpendChartProps) => {
  // Find max value to set as a reference for the chart height
  const maxValue = Math.max(...data.map(item => Math.max(item.sales, item.adSpend)));
  
  const config = {
    sales: {
      label: "Sales",
      color: "#2563eb" // Blue
    },
    adSpend: {
      label: "Ad Spend",
      color: "#ef4444" // Red
    },
    target: {
      label: "Target",
      color: "#10b981" // Green
    }
  };

  return (
    <ChartContainer 
      config={config} 
      className="h-[300px] w-full"
    >
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date"
          tickLine={false} 
          axisLine={false}
          fontSize={12}
        />
        <YAxis 
          tickFormatter={(value) => `$${value.toLocaleString()}`} 
          tickLine={false} 
          axisLine={false}
          fontSize={12}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} barSize={20} name="Sales" />
        <Bar dataKey="adSpend" fill="var(--color-adSpend)" radius={[4, 4, 0, 0]} barSize={20} name="Ad Spend" />
        {data[0]?.target && (
          <ReferenceLine y={data[0].target} stroke="var(--color-target)" strokeDasharray="3 3" />
        )}
      </ComposedChart>
    </ChartContainer>
  );
};
