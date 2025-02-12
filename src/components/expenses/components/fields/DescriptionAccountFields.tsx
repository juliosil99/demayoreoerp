
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
import type { BaseFieldProps } from "../types";
import type { SelectOption } from "../types";

interface Props extends BaseFieldProps {
  bankAccounts: SelectOption[];
  chartAccounts: SelectOption[];
}

export function DescriptionAccountFields({ formData, setFormData, bankAccounts = [], chartAccounts = [] }: Props) {
  const [openChartAccount, setOpenChartAccount] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    console.log('DescriptionAccountFields - Mounted');
    console.log('Initial chartAccounts:', chartAccounts);
    console.log('Initial bankAccounts:', bankAccounts);
    console.log('Initial formData:', formData);
    return () => {
      console.log('DescriptionAccountFields - Unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('Chart accounts updated:', chartAccounts);
  }, [chartAccounts]);

  useEffect(() => {
    console.log('Search value changed:', searchValue);
  }, [searchValue]);

  return (
    <>
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Cuenta Bancaria</Label>
        <Select
          value={formData.account_id}
          onValueChange={(value) => setFormData({ ...formData, account_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            {bankAccounts.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Cuenta de Gasto</Label>
        <Popover 
          open={openChartAccount} 
          onOpenChange={(isOpen) => {
            console.log('Chart Account Popover state changed:', isOpen);
            setOpenChartAccount(isOpen);
          }}
        >
          <PopoverTrigger asChild>
            <Input
              placeholder="Buscar cuenta de gasto..."
              value={chartAccounts.find(a => String(a.id) === formData.chart_account_id)?.name || ""}
              readOnly
              className="cursor-pointer"
              onClick={() => console.log('Input clicked, current chartAccounts:', chartAccounts)}
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
              <CommandInput placeholder="Buscar cuenta de gasto..." />
              <CommandEmpty>No se encontraron cuentas.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {chartAccounts.map((account) => {
                  console.log('Rendering account:', account);
                  return (
                    <CommandItem
                      key={account.id}
                      value={String(account.id)}
                      onSelect={(value) => {
                        console.log('Account selected:', value);
                        setFormData({ ...formData, chart_account_id: value });
                        setOpenChartAccount(false);
                      }}
                    >
                      {account.code} - {account.name}
                      {String(account.id) === formData.chart_account_id && (
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
