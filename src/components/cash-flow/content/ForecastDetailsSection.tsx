
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyForecastTable } from "@/components/cash-flow/WeeklyForecastTable";
import { ForecastItemsCard } from "@/components/cash-flow/ForecastItemsCard";
import { AIInsightCard } from "@/components/cash-flow/AIInsightCard";
import { ForecastWeek, ForecastItem } from "@/types/cashFlow";
import { MobileForecastSheet } from "@/components/cash-flow/MobileForecastSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

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
  onUpdateForecast?: () => void; // Added the missing prop
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
  onRequestAPIKey,
  onUpdateForecast
}: ForecastDetailsSectionProps) {
  const isMobile = useIsMobile();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);
  
  // Open the mobile sheet when a week is selected on mobile
  React.useEffect(() => {
    if (isMobile && selectedWeek) {
      setIsMobileSheetOpen(true);
    }
  }, [isMobile, selectedWeek]);
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        <WeeklyForecastTable 
          weeks={weeks} 
          selectedWeek={selectedWeek}
          onSelectWeek={onSelectWeek} 
        />
        
        <AIInsightCard 
          insights={insights || ""} 
          isGenerating={isGenerating}
          onRequestAPIKey={onRequestAPIKey}
        />
        
        <MobileForecastSheet 
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          selectedWeek={selectedWeek}
          items={items}
          onAddItem={onAddItem}
          onEditItem={onEditItem}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Proyección Semanal</TabsTrigger>
          <TabsTrigger value="insights">Insights AI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          <WeeklyForecastTable 
            weeks={weeks} 
            selectedWeek={selectedWeek}
            onSelectWeek={onSelectWeek} 
          />
          
          {selectedWeek && (
            <ForecastItemsCard 
              items={items.filter(item => item.week_id === selectedWeek.id)}
              weekId={selectedWeek.id}
              forecastId={selectedWeek.forecast_id}
              onAddItem={onAddItem}
              onEditItem={onEditItem}
            />
          )}
        </TabsContent>
        
        <TabsContent value="insights">
          <AIInsightCard 
            insights={insights || ""} 
            isGenerating={isGenerating}
            onRequestAPIKey={onRequestAPIKey}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
