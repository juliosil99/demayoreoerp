
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BaseFieldProps, SelectOption } from "../types";

interface Props extends BaseFieldProps {
  suppliers: SelectOption[];
}

export function PaymentSupplierFields({ formData, setFormData, suppliers }: Props) {
  const [open, setOpen] = useState(false);
  
  // Ensure suppliers is always an array and find the selected one
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const selectedSupplier = safeSuppliers.find(s => String(s.id) === formData.supplier_id);

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
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedSupplier?.name || "Seleccionar proveedor..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Buscar proveedor..." />
              <CommandEmpty>No se encontró ningún proveedor.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {safeSuppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={supplier.name}
                    onSelect={() => {
                      setFormData({ ...formData, supplier_id: String(supplier.id) });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.supplier_id === String(supplier.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {supplier.name}
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
