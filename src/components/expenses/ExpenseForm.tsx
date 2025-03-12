
import { Button } from "@/components/ui/button";
import { useExpenseForm } from "./hooks/useExpenseForm";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { ExpenseFormFields } from "./components/ExpenseFormFields";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

interface ExpenseFormProps {
  initialData?: Expense;
  expenseData?: Expense; // Add this for backward compatibility
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
  if (!Array.isArray(bankAccounts) || bankAccounts.length === 0 || 
      !Array.isArray(chartAccounts) || chartAccounts.length === 0) {
    return <div className="text-center p-4">No se encontraron las cuentas necesarias.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExpenseFormFields
        formData={formData}
        setFormData={setFormData}
        bankAccounts={bankAccounts}
        chartAccounts={chartAccounts}
        suppliers={Array.isArray(suppliers) ? suppliers : []}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : dataToUse ? "Actualizar Gasto" : "Crear Gasto"}
        </Button>
      </div>
    </form>
  );
}
