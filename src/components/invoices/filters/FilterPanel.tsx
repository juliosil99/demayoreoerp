
import React from "react";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "./DateRangeFilter";
import { InvoiceTypeFilter } from "./InvoiceTypeFilter";
import { AmountFilter } from "./AmountFilter";
import type { InvoiceFilters } from "../InvoiceFilters";

interface FilterPanelProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: InvoiceFilters) => void;
  clearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  clearFilters,
}) => {
  // Create a copy of the filters to avoid direct state mutation
  const updateFilters = (field: keyof InvoiceFilters, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="border p-4 rounded-md space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <DateRangeFilter
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(date) => updateFilters("dateFrom", date)}
          onDateToChange={(date) => updateFilters("dateTo", date)}
        />
        
        <InvoiceTypeFilter
          value={filters.invoiceType}
          onChange={(type) => updateFilters("invoiceType", type)}
        />
        
        <AmountFilter
          minAmount={filters.minAmount}
          maxAmount={filters.maxAmount}
          onMinAmountChange={(value) => updateFilters("minAmount", value)}
          onMaxAmountChange={(value) => updateFilters("maxAmount", value)}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="text-sm"
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
};
