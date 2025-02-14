
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaseFieldProps } from "../types";
import type { SelectOption } from "../types";

interface Props extends BaseFieldProps {
  bankAccounts: SelectOption[];
  chartAccounts: SelectOption[];
}

export function DescriptionAccountFields({ formData, setFormData, bankAccounts = [], chartAccounts = [] }: Props) {
  // Agrupar cuentas por tipo
  const groupedAccounts = chartAccounts.reduce((acc, account: any) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, typeof chartAccounts>);

  // Traducir los tipos de cuenta
  const accountTypeLabels: Record<string, string> = {
    asset: "Activos",
    liability: "Pasivos",
    expense: "Gastos"
  };

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
        <Label>Cuenta Contable</Label>
        <Select
          value={formData.chart_account_id}
          onValueChange={(value) => setFormData({ ...formData, chart_account_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta contable" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedAccounts).map(([type, accounts]) => (
              <SelectGroup key={type}>
                <SelectLabel>{accountTypeLabels[type] || type}</SelectLabel>
                {accounts.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
