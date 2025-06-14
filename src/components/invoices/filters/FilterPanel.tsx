
import React from "react";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "./DateRangeFilter";
import { InvoiceTypeFilter } from "./InvoiceTypeFilter";
import { AmountFilter } from "./AmountFilter";
import { ReconciliationStatusFilter } from "./ReconciliationStatusFilter";
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
  // Create wrapped handlers to avoid the functions being recreated on each render
  const handleDateFromChange = React.useCallback((date: Date | undefined) => {
    onFilterChange({ ...filters, dateFrom: date });
  }, [filters, onFilterChange]);

  const handleDateToChange = React.useCallback((date: Date | undefined) => {
    onFilterChange({ ...filters, dateTo: date });
  }, [filters, onFilterChange]);

  const handleInvoiceTypeChange = React.useCallback((type: string) => {
    onFilterChange({ ...filters, invoiceType: type });
  }, [filters, onFilterChange]);

  const handleMinAmountChange = React.useCallback((value: string) => {
    onFilterChange({ ...filters, minAmount: value });
  }, [filters, onFilterChange]);

  const handleMaxAmountChange = React.useCallback((value: string) => {
    onFilterChange({ ...filters, maxAmount: value });
  }, [filters, onFilterChange]);

  const handleReconciliationStatusChange = React.useCallback((status: string) => {
    onFilterChange({ ...filters, reconciliationStatus: status });
  }, [filters, onFilterChange]);

  return (
    <div className="border p-4 rounded-md space-y-4">
      <div className="space-y-4">
        <DateRangeFilter
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
        />
        
        <InvoiceTypeFilter
          value={filters.invoiceType}
          onChange={handleInvoiceTypeChange}
        />
        
        <ReconciliationStatusFilter
          value={filters.reconciliationStatus}
          onChange={handleReconciliationStatusChange}
        />
        
        <AmountFilter
          minAmount={filters.minAmount}
          maxAmount={filters.maxAmount}
          onMinAmountChange={handleMinAmountChange}
          onMaxAmountChange={handleMaxAmountChange}
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
