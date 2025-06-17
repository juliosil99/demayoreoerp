
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { MainMetricsSection } from "@/components/dashboard/MainMetricsSection";
import { ChannelMetricsSection } from "@/components/dashboard/sections/ChannelMetricsSection";
import { SalesSection } from "@/components/dashboard/sections/SalesSection";
import { useOptimizedMainDashboard } from "@/hooks/dashboard/useOptimizedMainDashboard";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  });

  const { combinedData: metrics, isLoading: loading } = useOptimizedMainDashboard(dateRange);

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
          <Link to="/analytics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ver Analytics Detallado
            </Button>
          </Link>
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
        <MainMetricsSection metrics={metrics || {}} />

        <div className="grid gap-6">
          <ChannelMetricsSection channelMetrics={metrics?.channelMetrics || []} />
        </div>

        <div className="grid gap-6">
          <SalesSection metrics={metrics || {}} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
