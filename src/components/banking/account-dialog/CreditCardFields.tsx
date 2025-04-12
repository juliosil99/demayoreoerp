
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NewBankAccount } from "../types";

interface CreditCardFieldsProps {
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
}

export function CreditCardFields({ account, setAccount }: CreditCardFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="payment_due_day">Día de Pago</Label>
          <Input
            id="payment_due_day"
            type="number"
            min="1"
            max="31"
            value={account.payment_due_day || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                payment_due_day: parseInt(e.target.value) || undefined,
              })
            }
            placeholder="Ej. 15"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="statement_cut_day">Día de Corte</Label>
          <Input
            id="statement_cut_day"
            type="number"
            min="1"
            max="31"
            value={account.statement_cut_day || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                statement_cut_day: parseInt(e.target.value) || undefined,
              })
            }
            placeholder="Ej. 5"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="credit_limit">Límite de Crédito</Label>
          <Input
            id="credit_limit"
            type="number"
            value={account.credit_limit || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                credit_limit: parseFloat(e.target.value) || undefined,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minimum_payment_percentage">
            Porcentaje de Pago Mínimo (%)
          </Label>
          <Input
            id="minimum_payment_percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={account.minimum_payment_percentage || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                minimum_payment_percentage: parseFloat(e.target.value) || undefined,
              })
            }
            placeholder="Ej. 10"
          />
        </div>
      </div>
    </>
  );
}
