
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
import type { BaseFieldProps } from "../types";
import type { SelectOption } from "../types";

interface Props extends BaseFieldProps {
  bankAccounts: SelectOption[];
  chartAccounts: SelectOption[];
}

export function DescriptionAccountFields({ formData, setFormData, bankAccounts = [], chartAccounts = [] }: Props) {
  const [openChartAccount, setOpenChartAccount] = useState(false);

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
        <Popover open={openChartAccount} onOpenChange={setOpenChartAccount}>
          <PopoverTrigger asChild>
            <Input
              placeholder="Buscar cuenta de gasto..."
              value={chartAccounts.find(a => String(a.id) === formData.chart_account_id)?.name || ""}
              readOnly
              className="cursor-pointer"
            />
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Buscar cuenta de gasto..." />
              <CommandEmpty>No se encontraron cuentas.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {chartAccounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={String(account.id)}
                    onSelect={(value) => {
                      setFormData({ ...formData, chart_account_id: value });
                      setOpenChartAccount(false);
                    }}
                  >
                    {account.code} - {account.name}
                    {String(account.id) === formData.chart_account_id && (
                      <CheckIcon className="ml-2 h-4 w-4" />
                    )}
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
