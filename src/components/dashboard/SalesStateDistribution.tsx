
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import { Loader2 } from "lucide-react";

// Enhanced color palette with better contrast and visual appeal
const COLORS = [
  '#9b87f5', // Primary purple
  '#7E69AB', // Secondary purple
  '#6E59A5', // Tertiary purple
  '#F97316', // Orange
  '#0EA5E9', // Blue
  '#D946EF', // Magenta
  '#8B5CF6', // Violet
  '#403E43'  // Dark gray
];

// Standardize state name formatting
const standardizeState = (state: string | null): string => {
  if (!state) return "Sin Estado";
  return state.trim().charAt(0).toUpperCase() + state.trim().slice(1).toLowerCase();
};

export const SalesStateDistribution = () => {
  const { data: stateDistribution, isLoading, error } = useQuery({
    queryKey: ["salesStateDistribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select('state, price');
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }

      // Group and aggregate sales data by state
      const stateGroups = data.reduce((acc: { [key: string]: { count: number, value: number } }, sale) => {
        const state = standardizeState(sale.state);
        if (!acc[state]) {
          acc[state] = { count: 0, value: 0 };
        }
        acc[state].count += 1;
        acc[state].value += sale.price || 0;
        return acc;
      }, {});

      // Convert to array and sort by value
      const sortedStates = Object.entries(stateGroups)
        .map(([state, data]) => ({
          state,
          count: data.count,
          value: data.value
        }))
        .sort((a, b) => b.value - a.value);

      // Take top 7 states and group the rest as "Otros"
      const topStates = sortedStates.slice(0, 7);
      const otherStates = sortedStates.slice(7);
      
      if (otherStates.length > 0) {
        const otherTotal = otherStates.reduce(
          (sum, state) => ({
            count: sum.count + state.count,
            value: sum.value + state.value
          }),
          { count: 0, value: 0 }
        );
        
        topStates.push({
          state: "Otros Estados",
          count: otherTotal.count,
          value: otherTotal.value
        });
      }

      // Calculate percentages based on total value
      const totalValue = sortedStates.reduce((sum, state) => sum + state.value, 0);
      return topStates.map(state => ({
        ...state,
        percentage: ((state.value / totalValue) * 100).toFixed(1)
      }));
    }
  });

  if (isLoading) {
    return (
      <Card className="shadow-md transition-all hover:shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Ventas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error loading sales distribution data:", error);
    return (
      <Card className="shadow-md border-destructive/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Ventas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-destructive">Error al cargar los datos</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stateDistribution || stateDistribution.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Ventas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No hay datos de ventas por estado disponibles</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the total value for the summary display
  const totalValue = stateDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución de Ventas por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
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
                      fill={COLORS[index % COLORS.length]}
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
          <div className="mt-2 text-sm text-center font-medium">
            Total: {formatCurrency(totalValue)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
