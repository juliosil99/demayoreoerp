
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CashFlowForecast } from "@/types/cashFlow";
import { Skeleton } from "@/components/ui/skeleton";

interface ForecastSelectorProps {
  forecasts?: CashFlowForecast[] | null;
  selectedForecastId?: string;
  forecast?: CashFlowForecast | null;
  isLoading: boolean;
  isGenerating: boolean;
  onForecastChange: (id: string) => void;
  onGenerateClick: () => void;
  isMobile?: boolean;
}

export function ForecastSelector({
  forecasts = [],
  selectedForecastId,
  forecast,
  isLoading,
  isGenerating,
  onForecastChange,
  isMobile = false
}: ForecastSelectorProps) {
  console.log("[DEBUG] ForecastSelector - Render with props:", {
    forecastsCount: forecasts?.length,
    selectedForecastId,
    forecastStatus: forecast?.status,
    isLoading,
    isGenerating,
  });
  
  const showGenerateButton = selectedForecastId && forecast?.status !== 'draft';
  console.log("[DEBUG] ForecastSelector - Should show Generate button:", showGenerateButton);
  
  if (isLoading) {
    return <Skeleton className={`h-10 ${isMobile ? 'w-full' : 'w-[300px]'}`} />;
  }
  
  if (!forecasts || forecasts.length === 0) {
    return null;
  }
  
  return (
    <div className={isMobile ? "w-full" : "w-[300px]"}>
      <Select
        value={selectedForecastId}
        onValueChange={onForecastChange}
        disabled={isGenerating}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar pronóstico" />
        </SelectTrigger>
        <SelectContent>
          {forecasts.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
