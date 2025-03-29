
import React from "react";
import { Button } from "@/components/ui/button";
import { InvoiceTypeFilter } from "./InvoiceTypeFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { AmountFilter } from "./AmountFilter";
import { InvoiceFilters } from "../InvoiceFilters";

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
  const handleSelectChange = (value: string) => {
    onFilterChange({ ...filters, invoiceType: value });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFilterChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFilterChange({ ...filters, dateTo: date });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
      <InvoiceTypeFilter 
        value={filters.invoiceType} 
        onChange={handleSelectChange} 
      />

      <DateRangeFilter 
        label="Fecha de Emisión (Desde)" 
        date={filters.dateFrom} 
        onDateChange={handleDateFromChange} 
      />

      <DateRangeFilter 
        label="Fecha de Emisión (Hasta)" 
        date={filters.dateTo} 
        onDateChange={handleDateToChange} 
      />

      <AmountFilter 
        id="minAmount" 
        label="Monto Mínimo" 
        value={filters.minAmount} 
        onChange={handleInputChange} 
        placeholder="Monto mínimo" 
      />

      <AmountFilter 
        id="maxAmount" 
        label="Monto Máximo" 
        value={filters.maxAmount} 
        onChange={handleInputChange} 
        placeholder="Monto máximo" 
      />

      <div className="flex items-end">
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};
