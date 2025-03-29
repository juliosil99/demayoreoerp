
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, FormFieldProps } from "./types";

interface AccountSelectProps extends FormFieldProps {
  accounts: Account[];
  isFromAccount: boolean;
}

export function AccountSelect({ 
  formData, 
  setFormData, 
  accounts, 
  isFromAccount 
}: AccountSelectProps) {
  const fieldId = isFromAccount ? "from_account_id" : "to_account_id";
  const label = isFromAccount ? "Cuenta Origen" : "Cuenta Destino";
  
  return (
    <div>
      <Label>{label}</Label>
      <Select
        value={formData[fieldId]}
        onValueChange={(value) => setFormData({ ...formData, [fieldId]: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar cuenta" />
        </SelectTrigger>
        <SelectContent>
          {accounts?.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.name} - {account.currency} ${account.balance?.toFixed(2)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
