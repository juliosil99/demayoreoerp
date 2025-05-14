
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface ProductSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  handleSearch: () => void;
  isLoading: boolean;
}

export const ProductSearchFilters = ({
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSearch,
  isLoading,
}: ProductSearchFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Input
          placeholder="Buscar por descripción de producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <DateRangePicker
            from={startDate}
            to={endDate}
            onFromChange={setStartDate}
            onToChange={setEndDate}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
