
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

// Interface for the DatePickerWithRange component
interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}

// Interface for the DateRangePicker component (for backward compatibility)
interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  className?: string;
}

// New component that uses a single DateRange object
export function DatePickerWithRange({
  date,
  setDate,
  className,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccione un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Legacy component that maintains the older API with separate from/to dates
export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  // Convert the separate from/to dates to a DateRange object for the internal Calendar
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    from || to ? { from, to } : undefined
  );
  
  // Update the DateRange when from or to props change
  React.useEffect(() => {
    setDateRange(from || to ? { from, to } : undefined);
  }, [from, to]);
  
  // Handle selection changes and propagate to parent via onFromChange/onToChange
  const handleSelect = React.useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range) {
      onFromChange(range.from);
      onToChange(range.to);
    }
  }, [onFromChange, onToChange]);
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !from && !to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "dd/MM/yyyy")} - {format(to, "dd/MM/yyyy")}
                </>
              ) : (
                format(from, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccione un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col gap-2 p-2">
            <div>
              <h4 className="font-medium mb-2">Fecha Inicial</h4>
              <Calendar
                mode="single"
                selected={from}
                onSelect={onFromChange}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Fecha Final</h4>
              <Calendar
                mode="single"
                selected={to}
                onSelect={onToChange}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) => (from ? date < from : false)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
