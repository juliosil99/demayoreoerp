
import React from "react";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Filters = {
  supplier_id?: string;
  account_id?: number;
  unreconciled?: boolean;
  from_payable?: boolean;
};

interface ExpenseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function ExpenseFilters({ filters, onFiltersChange }: ExpenseFiltersProps) {
  const { recipients, bankAccounts, isLoading } = useExpenseQueries();

  const handleRecipientChange = (value: string) => {
    onFiltersChange({ ...filters, supplier_id: value === "all" ? undefined : value });
  };

  const handleAccountChange = (value: string) => {
    onFiltersChange({ ...filters, account_id: value === "all" ? undefined : parseInt(value) });
  };

  if (isLoading) {
    return <div>Cargando filtros...</div>;
  }

  // Group recipients by type
  const groupedRecipients: { [key: string]: any[] } = {
    supplier: [],
    employee: []
  };
  
  if (Array.isArray(recipients)) {
    recipients.forEach(recipient => {
      if (recipient.type === 'supplier' || recipient.type === 'employee') {
        groupedRecipients[recipient.type].push(recipient);
      }
    });
  }

  return (
    <div className="flex gap-4">
      <Select
        value={filters.supplier_id || "all"}
        onValueChange={handleRecipientChange}
      >
        <SelectTrigger className="w-[250px] bg-black text-white border-none rounded-md">
          <SelectValue placeholder="Todos los destinatarios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los destinatarios</SelectItem>
          
          {groupedRecipients.supplier.length > 0 && (
            <>
              <SelectItem value="supplier_group" disabled className="font-semibold">Proveedores</SelectItem>
              {groupedRecipients.supplier.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </>
          )}
          
          {groupedRecipients.employee.length > 0 && (
            <>
              <SelectItem value="employee_group" disabled className="font-semibold">Empleados</SelectItem>
              {groupedRecipients.employee.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </>
          )}
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
