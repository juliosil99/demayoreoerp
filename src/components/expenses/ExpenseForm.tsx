
import { Button } from "@/components/ui/button";
import { useExpenseForm } from "./hooks/useExpenseForm";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { ExpenseFormFields } from "./components/ExpenseFormFields";
import { Skeleton } from "@/components/ui/skeleton";

export interface FormExpense {
  id: string;
  created_at: string | null;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  account_id: number;
  chart_account_id: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  supplier_id: string | null;
  category: string | null;
  bank_accounts?: { name: string };
  chart_of_accounts?: { name: string; code: string };
  contacts?: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
    }
  }[];
}

interface ExpenseFormProps {
  initialData?: FormExpense;
  expenseData?: FormExpense; // Add this for backward compatibility
  onSuccess?: () => void;
  onClose?: () => void;
}

export function ExpenseForm({ initialData, expenseData, onSuccess, onClose }: ExpenseFormProps) {
  // Use expenseData as fallback for initialData for backwards compatibility
  const dataToUse = initialData || expenseData;
  
  const { formData, setFormData, isSubmitting, handleSubmit } = useExpenseForm(dataToUse, () => {
    onSuccess?.();
    onClose?.();
  });
  const { bankAccounts, chartAccounts, suppliers, isLoading } = useExpenseQueries();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Ensure we have all required data before rendering the form
  if (!bankAccounts || bankAccounts.length === 0 || !chartAccounts || chartAccounts.length === 0) {
    return <div className="text-center p-4">No se encontraron las cuentas necesarias.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExpenseFormFields
        formData={formData}
        setFormData={setFormData}
        bankAccounts={bankAccounts}
        chartAccounts={chartAccounts}
        suppliers={suppliers || []}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : dataToUse ? "Actualizar Gasto" : "Crear Gasto"}
        </Button>
      </div>
    </form>
  );
}
