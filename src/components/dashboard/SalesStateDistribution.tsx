
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

// Function to standardize state names
const standardizeState = (state: string | null): string => {
  if (!state) return "pendiente";
  
  // Convert to lowercase for standardization
  const normalized = state.toLowerCase().trim();
  
  // Map common variations to standard names
  switch (normalized) {
    case "cobrado":
    case "pagado":
      return "cobrado";
    case "pendiente":
    case "por cobrar":
      return "pendiente";
    default:
      return normalized;
  }
};

export const SalesStateDistribution = () => {
  const { data: stateDistribution, isLoading, error } = useQuery({
    queryKey: ["salesStateDistribution"],
    queryFn: async () => {
      console.log("Fetching sales state distribution data...");
      const { data, error } = await supabase
        .from("Sales")
        .select('statusPaid, price');
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No sales data returned from query");
        return [];
      }
      
      console.log(`Received ${data.length} sales records`);
      
      // Create state groups with standardized states
      const stateGroups = data.reduce((acc: { [key: string]: { count: number, value: number } }, sale) => {
        const state = standardizeState(sale.statusPaid);
        if (!acc[state]) {
          acc[state] = { count: 0, value: 0 };
        }
        acc[state].count += 1;
        acc[state].value += sale.price || 0;
        return acc;
      }, {});

      console.log("State groups with values:", stateGroups);

      // Convert to array and sort by count
      const sortedStates = Object.entries(stateGroups)
        .map(([state, data]) => ({
          state: state.charAt(0).toUpperCase() + state.slice(1), // Capitalize first letter
          count: data.count,
          value: data.value
        }))
        .sort((a, b) => b.count - a.count);

      console.log("Sorted states:", sortedStates);

      // Calculate percentages based on total count
      const total = sortedStates.reduce((sum, state) => sum + state.count, 0);
      return sortedStates.map(state => ({
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
        <CardTitle>Distribución de Estados de Venta</CardTitle>
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
                  `${props.payload.percentage}% (${value} ventas - $${props.payload.value.toLocaleString('es-MX')})`,
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

