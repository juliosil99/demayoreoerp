
import React from "react";
import { ForecastWeek, ForecastItem, CashFlowForecast } from "@/types/cashFlow";
import { ForecastSummaryCards } from "@/components/cash-flow/ForecastSummaryCards";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";
import { WeeklyForecastTable } from "@/components/cash-flow/WeeklyForecastTable";
import { ForecastItemsCard } from "@/components/cash-flow/ForecastItemsCard";
import { AIInsightCard } from "@/components/cash-flow/AIInsightCard";

interface ForecastContentProps {
  weeks: ForecastWeek[];
  items: ForecastItem[];
  forecast?: CashFlowForecast | null;
  selectedWeek?: ForecastWeek;
  insights?: string;
  isGenerating: boolean;
  onSelectWeek: (week: ForecastWeek) => void;
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
  onRequestAPIKey: () => void;
}

export function ForecastContent({
  weeks,
  items,
  forecast,
  selectedWeek,
  insights,
  isGenerating,
  onSelectWeek,
  onAddItem,
  onEditItem,
  onRequestAPIKey
}: ForecastContentProps) {
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <ForecastSummaryCards weeks={weeks} forecast={forecast} />
      </div>
      
      <CashFlowChart weeks={weeks} />
      
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
    </>
  );
}
