
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const InvoiceTypeFilter: React.FC<InvoiceTypeFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="invoiceType">Tipo de Factura</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="invoiceType">
          <SelectValue placeholder="Todos los tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="I">Ingreso</SelectItem>
          <SelectItem value="E">Egreso (Nota de Crédito)</SelectItem>
          <SelectItem value="P">Pago</SelectItem>
          <SelectItem value="N">Nómina</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
