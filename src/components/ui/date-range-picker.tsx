
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

interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
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
