
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ForecastWeek, ForecastItem } from "@/types/cashFlow";
import { ForecastItemsCard } from "./ForecastItemsCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft } from "lucide-react";

interface MobileForecastSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeek?: ForecastWeek;
  items?: ForecastItem[];
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
}

export function MobileForecastSheet({
  isOpen,
  onClose,
  selectedWeek,
  items = [],
  onAddItem,
  onEditItem
}: MobileForecastSheetProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const weekItems = selectedWeek 
    ? items.filter(item => item.week_id === selectedWeek.id)
    : [];
  
  const formattedWeekNumber = selectedWeek ? `Semana ${selectedWeek.week_number}` : '';
  const formattedDateRange = selectedWeek 
    ? `${new Date(selectedWeek.week_start_date).toLocaleDateString()} - ${new Date(selectedWeek.week_end_date).toLocaleDateString()}`
    : '';
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] px-0">
        <SheetHeader className="px-4 mb-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onClose} className="mr-2 p-1">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <SheetTitle className="text-xl">{formattedWeekNumber}</SheetTitle>
              <p className="text-sm text-muted-foreground">{formattedDateRange}</p>
            </div>
          </div>
        </SheetHeader>
        
        <div className="px-4 pb-16 overflow-y-auto h-full">
          <ForecastItemsCard
            items={weekItems}
            weekId={selectedWeek?.id || ''}
            forecastId={selectedWeek?.forecast_id || ''}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
