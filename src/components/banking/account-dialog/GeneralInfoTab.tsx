
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewBankAccount, AccountCurrency } from "../types";

interface GeneralInfoTabProps {
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
  setSelectedTab: (tab: string) => void;
}

export function GeneralInfoTab({ account, setAccount, setSelectedTab }: GeneralInfoTabProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre de la Cuenta</Label>
        <Input
          id="name"
          value={account.name}
          onChange={(e) =>
            setAccount({ ...account, name: e.target.value })
          }
          placeholder="Ingrese el nombre de la cuenta"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="type">Tipo de Cuenta</Label>
        <Select
          value={account.type}
          onValueChange={(value) => {
            const newAccountType = value as NewBankAccount["type"];
            // Reset credit-specific fields if changing from credit type
            if (newAccountType !== "Credit Card" && newAccountType !== "Credit Simple") {
              setSelectedTab("general");
            }
            setAccount({ ...account, type: newAccountType });
          }}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Seleccione el tipo de cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bank">Banco</SelectItem>
            <SelectItem value="Cash">Efectivo</SelectItem>
            <SelectItem value="Credit Card">Tarjeta de Crédito</SelectItem>
            <SelectItem value="Credit Simple">Crédito Simple</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="currency">Moneda</Label>
        <Select
          value={account.currency}
          onValueChange={(value) =>
            setAccount({ ...account, currency: value as AccountCurrency })
          }
        >
          <SelectTrigger id="currency">
            <SelectValue placeholder="Seleccione la moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
            <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="initial_balance">Saldo Inicial</Label>
          <Input
            id="initial_balance"
            type="number"
            value={account.initial_balance}
            onChange={(e) =>
              setAccount({
                ...account,
                initial_balance: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="balance_date">Fecha del Saldo</Label>
          <Input
            id="balance_date"
            type="date"
            value={account.balance_date ? account.balance_date.split('T')[0] : ''}
            onChange={(e) =>
              setAccount({
                ...account,
                balance_date: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="balance">Saldo Actual</Label>
        <Input
          id="balance"
          type="number"
          value={account.balance}
          onChange={(e) =>
            setAccount({
              ...account,
              balance: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
