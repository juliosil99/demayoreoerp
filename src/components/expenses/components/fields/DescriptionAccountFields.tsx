
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExpenseFormData } from "../../hooks/useExpenseForm";

interface DescriptionAccountFieldsProps {
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
  bankAccounts: Array<{ id: number; name: string; currency: string }>;
  chartAccounts: Array<{ id: string; name: string; code: string }>;
  handleAccountChange?: (accountId: string) => void;
}

export function DescriptionAccountFields({
  formData,
  setFormData,
  bankAccounts,
  chartAccounts,
  handleAccountChange,
}: DescriptionAccountFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="account">Cuenta bancaria</Label>
        <Select
          value={formData.account_id}
          onValueChange={(value) => {
            if (handleAccountChange) {
              handleAccountChange(value);
            } else {
              setFormData({ ...formData, account_id: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {bankAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.name} ({account.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="chart_account">Cuenta contable</Label>
        <Select 
          value={formData.chart_account_id}
          onValueChange={(value) => setFormData({ ...formData, chart_account_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione una cuenta contable" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {chartAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.code} - {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="payment_method">Método de pago</Label>
        <Select
          value={formData.payment_method}
          onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="check">Cheque</SelectItem>
            <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
            <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
