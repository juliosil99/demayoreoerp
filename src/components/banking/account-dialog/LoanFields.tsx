
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NewBankAccount } from "../types";

interface LoanFieldsProps {
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
}

export function LoanFields({ account, setAccount }: LoanFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="original_loan_amount">Monto Original del Préstamo</Label>
          <Input
            id="original_loan_amount"
            type="number"
            value={account.original_loan_amount || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                original_loan_amount: parseFloat(e.target.value) || undefined,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="loan_start_date">Fecha de Inicio del Préstamo</Label>
          <Input
            id="loan_start_date"
            type="date"
            value={account.loan_start_date ? account.loan_start_date.split('T')[0] : ''}
            onChange={(e) =>
              setAccount({
                ...account,
                loan_start_date: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="monthly_payment">Pago Mensual</Label>
          <Input
            id="monthly_payment"
            type="number"
            value={account.monthly_payment || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                monthly_payment: parseFloat(e.target.value) || undefined,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="payment_due_day">Día de Pago Mensual</Label>
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
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="total_term_months">Plazo Total (Meses)</Label>
          <Input
            id="total_term_months"
            type="number"
            min="1"
            value={account.total_term_months || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                total_term_months: parseInt(e.target.value) || undefined,
              })
            }
            placeholder="Ej. 60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="remaining_months">Meses Restantes</Label>
          <Input
            id="remaining_months"
            type="number"
            min="0"
            value={account.remaining_months || ""}
            onChange={(e) =>
              setAccount({
                ...account,
                remaining_months: parseInt(e.target.value) || undefined,
              })
            }
            placeholder="Ej. 48"
          />
        </div>
      </div>
    </>
  );
}
