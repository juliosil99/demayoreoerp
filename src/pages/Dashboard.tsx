import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { ChannelDistributionSection } from "@/components/dashboard/sections/ChannelDistributionSection";
import { StateDistributionSection } from "@/components/dashboard/sections/StateDistributionSection";
import { ChannelMetricsSection } from "@/components/dashboard/sections/ChannelMetricsSection";
import { SalesSection } from "@/components/dashboard/sections/SalesSection";
import { TopSkusByUnitsSection } from "@/components/dashboard/sections/TopSkusByUnitsSection";
import { ContributionMarginSection } from "@/components/dashboard/sections/ContributionMarginSection";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { OptimizedTopSkusByUnitsSection } from "@/components/dashboard/sections/OptimizedTopSkusByUnitsSection";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  });

  const formattedDateRange = {
    from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { metrics, loading } = useDashboardMetrics(formattedDateRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Vista general de tu negocio.
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
                <Calendar className="mr-2 h-4 w-4" />
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
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid gap-6">
        <MainMetricsSection metrics={metrics} loading={loading}/>
        
        <div className="grid gap-6 md:grid-cols-2">
          <ChannelDistributionSection dateRange={dateRange} />
          <StateDistributionSection dateRange={dateRange} />
        </div>

        <div className="grid gap-6">
          <ChannelMetricsSection dateRange={dateRange} />
        </div>

        <div className="grid gap-6">
          <SalesSection dateRange={dateRange} />
        </div>

        <div className="grid gap-6">
          <OptimizedTopSkusByUnitsSection dateRange={dateRange} />
          <ContributionMarginSection dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
