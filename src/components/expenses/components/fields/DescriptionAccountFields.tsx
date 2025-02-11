
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaseFieldProps } from "../types";
import type { SelectOption } from "../types";

interface Props extends BaseFieldProps {
  bankAccounts: SelectOption[];
  chartAccounts: SelectOption[];
}

export function DescriptionAccountFields({ formData, setFormData, bankAccounts, chartAccounts }: Props) {
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
            {bankAccounts?.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Cuenta de Gasto</Label>
        <Select
          value={formData.chart_account_id}
          onValueChange={(value) => setFormData({ ...formData, chart_account_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta de gasto" />
          </SelectTrigger>
          <SelectContent>
            {chartAccounts?.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.code} - {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
