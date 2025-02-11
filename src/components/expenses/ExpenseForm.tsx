
import { Button } from "@/components/ui/button";
import { useExpenseForm } from "./hooks/useExpenseForm";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { ExpenseFormFields } from "./components/ExpenseFormFields";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

interface ExpenseFormProps {
  initialData?: Expense;
}

export function ExpenseForm({ initialData }: ExpenseFormProps) {
  const { formData, setFormData, isSubmitting, handleSubmit } = useExpenseForm(initialData);
  const { bankAccounts, chartAccounts, suppliers } = useExpenseQueries();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExpenseFormFields
        formData={formData}
        setFormData={setFormData}
        bankAccounts={bankAccounts || []}
        chartAccounts={chartAccounts || []}
        suppliers={suppliers || []}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : initialData ? "Actualizar Gasto" : "Crear Gasto"}
        </Button>
      </div>
    </form>
  );
}
