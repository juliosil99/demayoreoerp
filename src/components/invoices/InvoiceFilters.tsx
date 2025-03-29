
import React, { useState } from "react";
import { SearchInput } from "./filters/SearchInput";
import { FilterToggleButton } from "./filters/FilterToggleButton";
import { FilterPanel } from "./filters/FilterPanel";

export type InvoiceFilters = {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  invoiceType: string;
  minAmount: string;
  maxAmount: string;
};

type InvoiceFiltersProps = {
  filters: InvoiceFilters;
  onFilterChange: (filters: InvoiceFilters) => void;
};

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
      invoiceType: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== undefined
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchInput 
          value={filters.search} 
          onChange={handleInputChange} 
        />
        <FilterToggleButton 
          onClick={() => setShowFilters(!showFilters)} 
          activeFiltersCount={activeFiltersCount} 
        />
      </div>

      {showFilters && (
        <FilterPanel 
          filters={filters} 
          onFilterChange={onFilterChange} 
          clearFilters={clearFilters} 
        />
      )}
    </div>
  );
};
