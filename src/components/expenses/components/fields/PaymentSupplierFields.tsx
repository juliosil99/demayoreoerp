
import { useState, useEffect } from "react";
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
import { CheckIcon, Loader2 } from "lucide-react";
import type { BaseFieldProps, SelectOption } from "../types";

interface Props extends BaseFieldProps {
  suppliers: SelectOption[];
}

export function PaymentSupplierFields({ formData, setFormData, suppliers = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    console.log('PaymentSupplierFields - Mounted');
    console.log('Initial suppliers:', suppliers);
    console.log('Initial formData:', formData);
    return () => {
      console.log('PaymentSupplierFields - Unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('Suppliers updated:', suppliers);
  }, [suppliers]);

  useEffect(() => {
    console.log('Search value changed:', searchValue);
  }, [searchValue]);

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
        <Popover 
          open={open} 
          onOpenChange={(isOpen) => {
            console.log('Popover state changed:', isOpen);
            setOpen(isOpen);
          }}
        >
          <PopoverTrigger asChild>
            <Input
              placeholder="Buscar proveedor..."
              value={suppliers.find(s => String(s.id) === formData.supplier_id)?.name || ""}
              readOnly
              className="cursor-pointer"
              onClick={() => console.log('Input clicked, current suppliers:', suppliers)}
            />
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command 
              value={searchValue} 
              onValueChange={(value) => {
                console.log('Command value changed:', value);
                setSearchValue(value);
              }}
            >
              <CommandInput placeholder="Buscar proveedor..." />
              <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {suppliers.map((supplier) => {
                  console.log('Rendering supplier:', supplier);
                  return (
                    <CommandItem
                      key={supplier.id}
                      value={String(supplier.id)}
                      onSelect={(value) => {
                        console.log('Supplier selected:', value);
                        setFormData({ ...formData, supplier_id: value });
                        setOpen(false);
                      }}
                    >
                      {supplier.name}
                      {String(supplier.id) === formData.supplier_id && (
                        <CheckIcon className="ml-2 h-4 w-4" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
