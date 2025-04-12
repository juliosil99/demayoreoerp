
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WeeklyForecastTable } from "@/components/cash-flow/WeeklyForecastTable";
import { ForecastItemsCard } from "@/components/cash-flow/ForecastItemsCard";
import { AIInsightCard } from "@/components/cash-flow/AIInsightCard";
import { ForecastWeek, ForecastItem } from "@/types/cashFlow";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileForecastSheet } from "@/components/cash-flow/MobileForecastSheet";

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
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleWeekSelect = (week: ForecastWeek) => {
    onSelectWeek(week);
    if (isMobile) {
      setIsSheetOpen(true);
    }
  };
  
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };
  
  const filteredItems = selectedWeek 
    ? items.filter(item => item.week_id === selectedWeek.id)
    : [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Detalles del Pronóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <WeeklyForecastTable 
              weeks={weeks} 
              selectedWeek={selectedWeek} 
              onSelectWeek={handleWeekSelect} 
            />
          </div>
        </CardContent>
      </Card>
      
      {!isMobile && selectedWeek && (
        <div className="space-y-6">
          <ForecastItemsCard
            items={filteredItems}
            weekId={selectedWeek.id}
            forecastId={selectedWeek.forecast_id}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
          />
          
          <AIInsightCard 
            insights={insights || ''} 
            isLoading={isGenerating}
            onRequestAPIKey={onRequestAPIKey}
          />
        </div>
      )}
      
      {isMobile && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightCard 
                insights={insights || ''} 
                isLoading={isGenerating}
                onRequestAPIKey={onRequestAPIKey}
                isMobile={true}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      <MobileForecastSheet
        isOpen={isSheetOpen && !!isMobile}
        onClose={handleCloseSheet}
        selectedWeek={selectedWeek}
        items={items}
        onAddItem={onAddItem}
        onEditItem={onEditItem}
      />
    </div>
  );
}
