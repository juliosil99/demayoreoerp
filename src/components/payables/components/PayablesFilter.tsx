
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayableStatusFilter } from "../hooks/useFetchPayables";

interface PayablesFilterProps {
  currentFilter: PayableStatusFilter;
  onFilterChange: (value: PayableStatusFilter) => void;
}

export function PayablesFilter({ currentFilter, onFilterChange }: PayablesFilterProps) {
  return (
    <Tabs value={currentFilter} onValueChange={(value) => onFilterChange(value as PayableStatusFilter)}>
      <TabsList>
        <TabsTrigger value="pending">Pendientes</TabsTrigger>
        <TabsTrigger value="paid">Pagados</TabsTrigger>
        <TabsTrigger value="all">Todos</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
