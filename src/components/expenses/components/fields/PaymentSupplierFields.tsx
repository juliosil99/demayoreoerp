
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon } from "lucide-react";
import type { BaseFieldProps, SelectOption } from "../types";

interface Props extends BaseFieldProps {
  suppliers: SelectOption[];
}

export function PaymentSupplierFields({ formData, setFormData, suppliers = [] }: Props) {
  const [open, setOpen] = useState(false);
  const selectedSupplier = suppliers.find(s => String(s.id) === formData.supplier_id);

  return (
    <>
      <div className="space-y-2">
        <Label>Método de Pago</Label>
        <Select
          value={formData.payment_method}
          onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar método de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="check">Cheque</SelectItem>
            <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Proveedor</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              placeholder="Buscar proveedor..."
              value={selectedSupplier?.name || ""}
              readOnly
              className="cursor-pointer"
            />
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command defaultValue={formData.supplier_id}>
              <CommandInput placeholder="Buscar proveedor..." />
              <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={String(supplier.id)}
                    onSelect={() => {
                      setFormData({ ...formData, supplier_id: String(supplier.id) });
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{supplier.name}</span>
                      {String(supplier.id) === formData.supplier_id && (
                        <CheckIcon className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
