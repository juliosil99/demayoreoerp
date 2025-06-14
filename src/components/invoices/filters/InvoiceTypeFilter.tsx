
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_TYPE_MAP } from "@/utils/invoiceTypeUtils";

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
      <Label htmlFor="invoiceType">Tipo de Comprobante</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="invoiceType">
          <SelectValue placeholder="Todos los tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          {Object.entries(INVOICE_TYPE_MAP).map(([code, info]) => (
            <SelectItem key={code} value={code}>
              {info.label} - {info.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
