
import React, { useState, useCallback } from "react";
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

  // Debounced search to avoid too many requests
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout to update filters after 500ms
    const newTimeout = setTimeout(() => {
      onFilterChange({ ...filters, search: value });
    }, 500);

    setSearchTimeout(newTimeout);
  }, [filters, onFilterChange, searchTimeout]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  }, [filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    onFilterChange({
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
      invoiceType: "",
      minAmount: "",
      maxAmount: "",
    });
  }, [onFilterChange]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prevState => !prevState);
  }, []);

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => {
      if (key === 'search') return searchTerm !== "";
      return value !== "" && value !== undefined;
    }
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchInput 
          value={searchTerm}
          onChange={handleSearchChange} 
        />
        <FilterToggleButton 
          onClick={toggleFilters} 
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
