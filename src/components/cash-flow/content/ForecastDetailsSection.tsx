
import React from "react";
import { ForecastWeek, ForecastItem } from "@/types/cashFlow";
import { WeeklyForecastTable } from "@/components/cash-flow/WeeklyForecastTable";
import { ForecastItemsCard } from "@/components/cash-flow/ForecastItemsCard";
import { AIInsightCard } from "@/components/cash-flow/AIInsightCard";

interface ForecastDetailsSectionProps {
  weeks: ForecastWeek[];
  items: ForecastItem[];
  selectedWeek?: ForecastWeek;
  insights?: string;
  isGenerating: boolean;
  onSelectWeek: (week: ForecastWeek) => void;
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
  onRequestAPIKey: () => void;
}

export function ForecastDetailsSection({
  weeks,
  items,
  selectedWeek,
  insights,
  isGenerating,
  onSelectWeek,
  onAddItem,
  onEditItem,
  onRequestAPIKey
}: ForecastDetailsSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <WeeklyForecastTable 
        weeks={weeks} 
        onSelectWeek={onSelectWeek}
        selectedWeekId={selectedWeek?.id}
      />
      
      <ForecastItemsCard 
        selectedWeek={selectedWeek} 
        items={items}
        onAddItem={onAddItem}
        onEditItem={onEditItem}
      />
      
      <AIInsightCard 
        insights={insights || ''}
        isLoading={isGenerating}
        onRequestAPIKey={onRequestAPIKey}
      />
    </div>
  );
}
