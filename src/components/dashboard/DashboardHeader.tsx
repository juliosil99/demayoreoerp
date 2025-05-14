
import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface DashboardHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export const DashboardHeader = ({ dateRange, setDateRange }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      </div>
      <DatePickerWithRange
        date={dateRange}
        setDate={setDateRange}
        className="w-full md:w-auto"
      />
    </div>
  );
};
