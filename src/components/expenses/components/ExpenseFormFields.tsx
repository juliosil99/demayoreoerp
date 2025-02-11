
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateAmountFields } from "./fields/DateAmountFields";
import { DescriptionAccountFields } from "./fields/DescriptionAccountFields";
import { PaymentSupplierFields } from "./fields/PaymentSupplierFields";
import { TaxRegimeFields } from "./fields/TaxRegimeFields";
import { TaxDetailsFields } from "./TaxDetailsFields";
import type { ExpenseFormData } from "../hooks/useExpenseForm";

interface ExpenseFormFieldsProps {
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
  bankAccounts: any[];
  chartAccounts: any[];
  suppliers: any[];
}

export function ExpenseFormFields({
  formData,
  setFormData,
  bankAccounts,
  chartAccounts,
  suppliers,
}: ExpenseFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <DateAmountFields formData={formData} setFormData={setFormData} />
        <DescriptionAccountFields 
          formData={formData} 
          setFormData={setFormData}
          bankAccounts={bankAccounts}
          chartAccounts={chartAccounts}
        />
        <PaymentSupplierFields 
          formData={formData} 
          setFormData={setFormData}
          suppliers={suppliers}
        />
        <TaxRegimeFields formData={formData} setFormData={setFormData} />
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Detalles de Impuestos</Label>
        <TaxDetailsFields
          taxDetails={formData.tax_details}
          onChange={(taxDetails) => setFormData({ ...formData, tax_details: taxDetails })}
        />
      </div>
    </div>
  );
}
