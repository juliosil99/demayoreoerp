
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateAmountFields } from "./fields/DateAmountFields";
import { DescriptionAccountFields } from "./fields/DescriptionAccountFields";
import { PaymentRecipientFields } from "./fields/PaymentRecipientFields";
import type { ExpenseFormData } from "../hooks/useExpenseForm";

interface ExpenseFormFieldsProps {
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
  bankAccounts: any[];
  chartAccounts: any[];
  recipients: any[];
  accountCurrency?: string;
  onRecipientSelect?: (recipientId: string, defaultChartAccountId?: string) => void;
  handleAccountChange?: (accountId: string) => void;
  handleCurrencyChange?: (currency: string) => void;
  handleExchangeRateChange?: (exchangeRate: string) => void;
  handleOriginalAmountChange?: (originalAmount: string) => void;
  handleReturnToggle?: (checked: boolean) => void;
}

export function ExpenseFormFields({
  formData,
  setFormData,
  bankAccounts,
  chartAccounts,
  recipients,
  accountCurrency = "MXN",
  onRecipientSelect,
  handleAccountChange,
  handleCurrencyChange,
  handleExchangeRateChange,
  handleOriginalAmountChange,
  handleReturnToggle,
}: ExpenseFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <DateAmountFields 
          formData={formData} 
          setFormData={setFormData}
          accountCurrency={accountCurrency}
          handleCurrencyChange={handleCurrencyChange}
          handleExchangeRateChange={handleExchangeRateChange}
          handleOriginalAmountChange={handleOriginalAmountChange}
          handleReturnToggle={handleReturnToggle}
        />
        <DescriptionAccountFields 
          formData={formData} 
          setFormData={setFormData}
          bankAccounts={bankAccounts}
          chartAccounts={chartAccounts}
          handleAccountChange={handleAccountChange}
        />
        <PaymentRecipientFields 
          formData={formData} 
          setFormData={setFormData}
          recipients={recipients}
          onRecipientSelect={onRecipientSelect}
        />
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
