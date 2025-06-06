
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface OptimizedSalesSearchProps {
  onSearch: (value: string) => void;
}

export const OptimizedSalesSearch = ({ onSearch }: OptimizedSalesSearchProps) => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Trigger search when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        type="search"
        placeholder="Buscar por número de orden..."
        className="pl-10"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </div>
  );
};
