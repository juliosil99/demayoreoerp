
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

export const SalesStateDistribution = () => {
  const { data: stateDistribution, isLoading, error } = useQuery({
    queryKey: ["salesStateDistribution"],
    queryFn: async () => {
      console.log("Fetching sales state distribution data...");
      const { data, error } = await supabase
        .from("Sales")
        .select('state');
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No sales data returned from query");
        return [];
      }
      
      console.log(`Received ${data.length} sales records`);
      
      // Filter out null states
      const validSales = data.filter(sale => sale.state);
      console.log(`${validSales.length} sales have valid states`);
      
      // Group sales by state and calculate count
      const stateGroups = validSales.reduce((acc: { [key: string]: number }, sale) => {
        if (sale.state) {
          acc[sale.state] = (acc[sale.state] || 0) + 1;
        }
        return acc;
      }, {});

      console.log("State groups:", stateGroups);

      // Convert to array and sort by count
      const sortedStates = Object.entries(stateGroups)
        .map(([state, count]) => ({
          state,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      console.log("Sorted states:", sortedStates);

      // Take top 7 states and sum the rest
      const topStates = sortedStates.slice(0, 7);
      const otherStates = sortedStates.slice(7);
      
      const otherCount = otherStates.reduce((sum, state) => sum + state.count, 0);
      
      if (otherCount > 0) {
        topStates.push({
          state: "Otros",
          count: otherCount,
        });
      }

      // Calculate percentages
      const total = topStates.reduce((sum, state) => sum + state.count, 0);
      return topStates.map(state => ({
        ...state,
        percentage: ((state.count / total) * 100).toFixed(1)
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Ventas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Cargando datos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error loading sales distribution data:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Ventas por Estado</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Ventas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No hay datos de ventas por estado disponibles</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Ventas por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stateDistribution}
                dataKey="count"
                nameKey="state"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ state, percentage }) => `${state} (${percentage}%)`}
              >
                {stateDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${props.payload.percentage}% (${value} ventas)`,
                  props.payload.state
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
