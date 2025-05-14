
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { StateData, STATE_CHART_COLORS } from "./utils";
import { formatCurrency } from "@/utils/formatters";

interface StatePieChartProps {
  stateDistribution: StateData[];
}

export const StatePieChart = ({ stateDistribution }: StatePieChartProps) => {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stateDistribution}
            dataKey="value"
            nameKey="state"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
            paddingAngle={1}
            cornerRadius={3}
          >
            {stateDistribution?.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={STATE_CHART_COLORS[index % STATE_CHART_COLORS.length]}
                stroke="transparent"
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name, props: any) => [
              `${formatCurrency(value)} (${props.payload.percentage}%)`,
              props.payload.state
            ]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '8px 12px'
            }}
          />
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value, entry, index) => {
              const item = stateDistribution?.[index];
              return (
                <span className="text-xs font-medium">
                  {value} ({item?.percentage}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
