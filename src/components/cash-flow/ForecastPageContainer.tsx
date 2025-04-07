
import React from "react";
import { ForecastHeader } from "@/components/cash-flow/ForecastHeader";
import { ForecastSelector } from "@/components/cash-flow/ForecastSelector";
import { EmptyForecastState } from "@/components/cash-flow/EmptyForecastState";
import { ForecastContent } from "@/components/cash-flow/ForecastContent";
import { CashFlowForecast, ForecastWeek, ForecastItem } from "@/types/cashFlow";

interface ForecastPageContainerProps {
  forecast?: CashFlowForecast | null;
  forecasts?: CashFlowForecast[] | null;
  weeks?: ForecastWeek[];
  items?: ForecastItem[];
  selectedForecastId?: string;
  selectedWeek?: ForecastWeek;
  insights?: string;
  isLoading: boolean;
  isLoadingForecasts: boolean;
  isGenerating: boolean;
  onForecastChange: (id: string) => void;
  onCreateForecastClick: () => void;
  onGenerateForecastClick: () => void;
  onSelectWeek: (week: ForecastWeek) => void;
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
  onRequestAPIKey: () => void;
}

export function ForecastPageContainer({
  forecast,
  forecasts,
  weeks,
  items = [],
  selectedForecastId,
  selectedWeek,
  insights,
  isLoading,
  isLoadingForecasts,
  isGenerating,
  onForecastChange,
  onCreateForecastClick,
  onGenerateForecastClick,
  onSelectWeek,
  onAddItem,
  onEditItem,
  onRequestAPIKey
}: ForecastPageContainerProps) {
  const isDataLoading = isLoading || isLoadingForecasts;
  const hasWeeks = weeks && weeks.length > 0;
  
  return (
    <div className="container p-6 space-y-6">
      <ForecastHeader 
        forecast={forecast}
        isGenerating={isGenerating}
        onCreateForecastClick={onCreateForecastClick}
        onGenerateForecastClick={onGenerateForecastClick}
        selectedForecastId={selectedForecastId}
      />
      
      {(forecasts?.length > 0 || isLoadingForecasts) && (
        <ForecastSelector 
          forecasts={forecasts}
          selectedForecastId={selectedForecastId}
          forecast={forecast}
          isLoading={isDataLoading}
          isGenerating={isGenerating}
          onForecastChange={onForecastChange}
          onGenerateClick={onGenerateForecastClick}
        />
      )}
      
      {selectedForecastId && hasWeeks ? (
        <ForecastContent 
          weeks={weeks}
          items={items}
          selectedWeek={selectedWeek}
          insights={insights || ''}
          isGenerating={isGenerating}
          onSelectWeek={onSelectWeek}
          onAddItem={onAddItem}
          onEditItem={onEditItem}
          onRequestAPIKey={onRequestAPIKey}
        />
      ) : (
        <div className="mt-20 text-center">
          <EmptyForecastState 
            isLoading={isDataLoading}
            forecastsCount={forecasts?.length || 0}
            selectedForecastId={selectedForecastId}
            hasWeeks={hasWeeks}
            onCreateClick={onCreateForecastClick}
            onConfigureAPIKeyClick={onRequestAPIKey}
            onGenerateClick={onGenerateForecastClick}
            isGenerating={isGenerating}
          />
        </div>
      )}
    </div>
  );
}
