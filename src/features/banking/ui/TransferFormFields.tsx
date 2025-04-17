
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AccountCurrency, TransferFormData } from "../types";
import { formatCurrency } from "@/lib/utils";

interface TransferFormFieldsProps {
  formData: TransferFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransferFormData>>;
  accounts: Array<{
    id: number;
    name: string;
    balance: number;
    currency: AccountCurrency;
  }>;
}

export function TransferFormFields({ 
  formData, 
  setFormData, 
  accounts 
}: TransferFormFieldsProps) {
  const [fromCurrency, setFromCurrency] = useState<AccountCurrency>("MXN");
  const [toCurrency, setToCurrency] = useState<AccountCurrency>("MXN");
  
  // Update formData when amount changes based on exchange rate
  useEffect(() => {
    if (fromCurrency === toCurrency) {
      setFormData(prev => ({
        ...prev,
        amount_to: prev.amount_from,
        exchange_rate: "1"
      }));
    } else {
      // Different currencies, apply exchange rate
      const amount_to = parseFloat(formData.amount_from) * parseFloat(formData.exchange_rate || "1");
      setFormData(prev => ({
        ...prev,
        amount_to: amount_to.toString()
      }));
    }
  }, [formData.amount_from, formData.exchange_rate, fromCurrency, toCurrency, setFormData]);

  // Update form data when account selection changes
  const handleFromAccountChange = (value: string) => {
    const account = accounts.find(a => a.id.toString() === value);
    setFormData(prev => ({
      ...prev,
      from_account_id: value
    }));
    if (account) {
      setFromCurrency(account.currency);
    }
  };

  const handleToAccountChange = (value: string) => {
    const account = accounts.find(a => a.id.toString() === value);
    setFormData(prev => ({
      ...prev,
      to_account_id: value
    }));
    if (account) {
      setToCurrency(account.currency);
    }
  };

  // Get selected account information
  const selectedFromAccount = accounts.find(a => a.id.toString() === formData.from_account_id);
  const selectedToAccount = accounts.find(a => a.id.toString() === formData.to_account_id);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="from_account">Cuenta Origen</Label>
        <Select
          value={formData.from_account_id}
          onValueChange={handleFromAccountChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Cuentas</SelectLabel>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name} - {formatCurrency(account.balance)} ({account.currency})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="to_account">Cuenta Destino</Label>
        <Select
          value={formData.to_account_id}
          onValueChange={handleToAccountChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Cuentas</SelectLabel>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name} - {formatCurrency(account.balance)} ({account.currency})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount_from">
          Monto {fromCurrency && `(${fromCurrency})`}
        </Label>
        <Input
          id="amount_from"
          type="number"
          step="0.01"
          value={formData.amount_from}
          onChange={(e) => setFormData(prev => ({ ...prev, amount_from: e.target.value }))}
        />
      </div>

      {fromCurrency !== toCurrency && (
        <div className="space-y-2">
          <Label htmlFor="exchange_rate">Tipo de Cambio</Label>
          <Input
            id="exchange_rate"
            type="number"
            step="0.0001"
            value={formData.exchange_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, exchange_rate: e.target.value }))}
          />
          <p className="text-sm text-muted-foreground">
            1 {fromCurrency} = {formData.exchange_rate} {toCurrency}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount_to">
          Monto Destino {toCurrency && `(${toCurrency})`}
        </Label>
        <Input
          id="amount_to"
          type="number"
          step="0.01"
          value={formData.amount_to}
          onChange={(e) => setFormData(prev => ({ ...prev, amount_to: e.target.value }))}
          disabled={fromCurrency === toCurrency}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference_number">Número de Referencia</Label>
        <Input
          id="reference_number"
          value={formData.reference_number}
          onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>
    </div>
  );
}
