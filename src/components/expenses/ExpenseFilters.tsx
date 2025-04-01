
import React from "react";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Filters = {
  supplier_id?: string;
  account_id?: number;
  unreconciled?: boolean;
};

interface ExpenseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function ExpenseFilters({ filters, onFiltersChange }: ExpenseFiltersProps) {
  const { suppliers, bankAccounts, isLoading } = useExpenseQueries();

  const handleSupplierChange = (value: string) => {
    onFiltersChange({ ...filters, supplier_id: value === "all" ? undefined : value });
  };

  const handleAccountChange = (value: string) => {
    onFiltersChange({ ...filters, account_id: value === "all" ? undefined : parseInt(value) });
  };

  if (isLoading) {
    return <div>Cargando filtros...</div>;
  }

  return (
    <div className="flex gap-4">
      <Select
        value={filters.supplier_id || "all"}
        onValueChange={handleSupplierChange}
      >
        <SelectTrigger className="w-[250px] bg-black text-white border-none rounded-md">
          <SelectValue placeholder="Todos los proveedores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los proveedores</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.account_id?.toString() || "all"}
        onValueChange={handleAccountChange}
      >
        <SelectTrigger className="w-[250px] bg-black text-white border-none rounded-md">
          <SelectValue placeholder="Todas las cuentas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las cuentas</SelectItem>
          {bankAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
