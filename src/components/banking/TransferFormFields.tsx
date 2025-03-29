
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { BankAccount, AccountCurrency } from "@/components/banking/types";

interface Account {
  id: number;
  name: string;
  balance: number;
  currency: AccountCurrency;
}

export interface TransferFormData {
  date: string;
  from_account_id: string;
  to_account_id: string;
  amount_from: string;
  amount_to: string;
  exchange_rate: string;
  reference_number: string;
  notes: string;
}

interface TransferFormFieldsProps {
  formData: TransferFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransferFormData>>;
  accounts: Array<Account>;
}

export function TransferFormFields({ 
  formData, 
  setFormData, 
  accounts 
}: TransferFormFieldsProps) {
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);
  const [isCrossCurrency, setIsCrossCurrency] = useState(false);

  // Update selectedAccounts when account selection changes
  useEffect(() => {
    if (formData.from_account_id) {
      const account = accounts.find(a => a.id.toString() === formData.from_account_id);
      setFromAccount(account || null);
    } else {
      setFromAccount(null);
    }
    
    if (formData.to_account_id) {
      const account = accounts.find(a => a.id.toString() === formData.to_account_id);
      setToAccount(account || null);
    } else {
      setToAccount(null);
    }
  }, [formData.from_account_id, formData.to_account_id, accounts]);

  // Determine if this is a cross-currency transfer
  useEffect(() => {
    if (fromAccount && toAccount) {
      setIsCrossCurrency(fromAccount.currency !== toAccount.currency);
    } else {
      setIsCrossCurrency(false);
    }
  }, [fromAccount, toAccount]);

  // Update the destination amount based on exchange rate
  useEffect(() => {
    if (isCrossCurrency && formData.amount_from && formData.exchange_rate) {
      const sourceAmount = parseFloat(formData.amount_from);
      const rate = parseFloat(formData.exchange_rate);
      
      if (!isNaN(sourceAmount) && !isNaN(rate) && rate > 0) {
        const destAmount = (sourceAmount * rate).toFixed(2);
        setFormData(prev => ({
          ...prev,
          amount_to: destAmount
        }));
      }
    } else if (!isCrossCurrency && formData.amount_from) {
      // Same currency, amounts are equal
      setFormData(prev => ({
        ...prev,
        amount_to: formData.amount_from,
        exchange_rate: "1"
      }));
    }
  }, [formData.amount_from, formData.exchange_rate, isCrossCurrency, setFormData]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Cantidad desde origen</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount_from}
            onChange={(e) => setFormData({ ...formData, amount_from: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cuenta Origen</Label>
          <Select
            value={formData.from_account_id}
            onValueChange={(value) => setFormData({ ...formData, from_account_id: value })}
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
        <div>
          <Label>Cuenta Destino</Label>
          <Select
            value={formData.to_account_id}
            onValueChange={(value) => setFormData({ ...formData, to_account_id: value })}
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
      </div>

      {isCrossCurrency && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Cambio ({fromAccount?.currency} a {toAccount?.currency})</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Tipo de cambio"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Cantidad en destino ({toAccount?.currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount_to}
                  onChange={(e) => setFormData({ ...formData, amount_to: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <Label>Número de Referencia</Label>
        <Input
          value={formData.reference_number}
          onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          placeholder="Número de referencia (opcional)"
        />
      </div>

      <div>
        <Label>Notas</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales (opcional)"
        />
      </div>
    </>
  );
}
