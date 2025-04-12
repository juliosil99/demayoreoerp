
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NewBankAccount } from "../types";
import { CreditCardFields } from "./CreditCardFields";
import { LoanFields } from "./LoanFields";

interface CreditDetailsTabProps {
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
  isCreditCard: boolean;
}

export function CreditDetailsTab({ account, setAccount, isCreditCard }: CreditDetailsTabProps) {
  return (
    <div className="grid gap-4">
      {isCreditCard ? (
        <CreditCardFields account={account} setAccount={setAccount} />
      ) : (
        <LoanFields account={account} setAccount={setAccount} />
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="interest_rate">Tasa de Interés Anual (%)</Label>
        <Input
          id="interest_rate"
          type="number"
          min="0"
          step="0.01"
          value={account.interest_rate || ""}
          onChange={(e) =>
            setAccount({
              ...account,
              interest_rate: parseFloat(e.target.value) || undefined,
            })
          }
          placeholder={isCreditCard ? "Ej. 36.5" : "Ej. 12.5"}
        />
      </div>
    </div>
  );
}
