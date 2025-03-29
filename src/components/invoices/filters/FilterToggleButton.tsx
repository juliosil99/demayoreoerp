
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterToggleButtonProps {
  onClick: () => void;
  activeFiltersCount: number;
}

export const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
  onClick,
  activeFiltersCount,
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="gap-2"
    >
      <Filter className="h-4 w-4" />
      Filtros
      {activeFiltersCount > 0 && (
        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );
};
