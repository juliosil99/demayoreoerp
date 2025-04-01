
import React, { useState } from "react";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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

  const handleUnreconciledChange = (checked: boolean | "indeterminate") => {
    onFiltersChange({ ...filters, unreconciled: checked === true });
  };

  if (isLoading) {
    return <div>Cargando filtros...</div>;
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="w-full sm:w-64">
        <Label htmlFor="supplier" className="mb-2 block">Proveedor</Label>
        <Select
          value={filters.supplier_id || "all"}
          onValueChange={handleSupplierChange}
        >
          <SelectTrigger id="supplier">
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
      </div>

      <div className="w-full sm:w-64">
        <Label htmlFor="account" className="mb-2 block">Cuenta Bancaria</Label>
        <Select
          value={filters.account_id?.toString() || "all"}
          onValueChange={handleAccountChange}
        >
          <SelectTrigger id="account">
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

      <div className="flex items-center space-x-2 pt-6">
        <Checkbox 
          id="unreconciled" 
          checked={!!filters.unreconciled} 
          onCheckedChange={handleUnreconciledChange} 
        />
        <Label 
          htmlFor="unreconciled" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Sin conciliar
        </Label>
      </div>
    </div>
  );
}
