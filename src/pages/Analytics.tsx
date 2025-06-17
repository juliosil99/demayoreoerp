
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChannelDistributionSection } from "@/components/dashboard/sections/ChannelDistributionSection";
import { StateDistributionSection } from "@/components/dashboard/sections/StateDistributionSection";
import { OptimizedTopSkusByUnitsSection } from "@/components/dashboard/sections/OptimizedTopSkusByUnitsSection";
import { ContributionMarginSection } from "@/components/dashboard/sections/ContributionMarginSection";
import { useOptimizedAnalytics } from "@/hooks/dashboard/useOptimizedAnalytics";

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  });

  const { analyticsData, isLoading } = useOptimizedAnalytics(dateRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Análisis detallado de ventas y distribución.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
                      dateRange.to,
                      "MMM dd, yyyy"
                    )}`
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                pagedNavigation
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ChannelDistributionSection dateRange={dateRange} />
          <StateDistributionSection dateRange={dateRange} />
        </div>

        <div className="grid gap-6">
          <OptimizedTopSkusByUnitsSection dateRange={dateRange} />
          <ContributionMarginSection 
            contributionMargin={analyticsData?.contributionMargin || 0}
            contributionMarginChange={analyticsData?.contributionMarginChange || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
