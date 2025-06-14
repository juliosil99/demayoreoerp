
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReconciliationStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const ReconciliationStatusFilter: React.FC<ReconciliationStatusFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <Label htmlFor="reconciliation-status" className="text-sm font-medium">
        Estado de Reconciliación
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="reconciliation-status">
          <SelectValue placeholder="Seleccionar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las facturas</SelectItem>
          <SelectItem value="reconciled">Solo reconciliadas</SelectItem>
          <SelectItem value="unreconciled">Solo no reconciliadas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
