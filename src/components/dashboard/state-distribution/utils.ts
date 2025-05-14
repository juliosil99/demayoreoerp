
import { SalesBase } from "@/integrations/supabase/types/sales";

// Enhanced color palette with better contrast and visual appeal
export const STATE_CHART_COLORS = [
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
export const standardizeState = (state: string | null): string => {
  if (!state) return "Sin Estado";
  return state.trim().charAt(0).toUpperCase() + state.trim().slice(1).toLowerCase();
};

export interface StateData {
  state: string;
  count: number;
  value: number;
  percentage?: string;
}

export const processStateData = (salesData: SalesBase[]): StateData[] => {
  if (!salesData || salesData.length === 0) {
    return [];
  }

  // Group and aggregate sales data by state
  const stateGroups = salesData.reduce((acc: { [key: string]: { count: number, value: number } }, sale) => {
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
};

export const calculateTotalValue = (stateData: StateData[]): number => {
  return stateData.reduce((sum, item) => sum + item.value, 0);
};
