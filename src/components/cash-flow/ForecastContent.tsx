
import React from "react";
import { ForecastWeek, ForecastItem, CashFlowForecast } from "@/types/cashFlow";
import { ForecastSummarySection } from "@/components/cash-flow/content/ForecastSummarySection";
import { ForecastChartSection } from "@/components/cash-flow/content/ForecastChartSection";
import { ForecastDetailsSection } from "@/components/cash-flow/content/ForecastDetailsSection";

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
      <ForecastSummarySection weeks={weeks} forecast={forecast} />
      
      <ForecastChartSection weeks={weeks} />
      
      <ForecastDetailsSection
        weeks={weeks}
        items={items}
        selectedWeek={selectedWeek}
        insights={insights}
        isGenerating={isGenerating}
        onSelectWeek={onSelectWeek}
        onAddItem={onAddItem}
        onEditItem={onEditItem}
        onRequestAPIKey={onRequestAPIKey}
      />
    </>
  );
}
