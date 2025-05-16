
import { Button } from "@/components/ui/button";
import { useExpenseForm } from "./hooks/useExpenseForm";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { ExpenseFormFields } from "./components/ExpenseFormFields";
import { Skeleton } from "@/components/ui/skeleton";
import type { Expense } from "./components/types";

interface ExpenseFormProps {
  initialData?: Expense;
  expenseData?: Expense; // Add this for backward compatibility
  onSuccess?: () => void;
  onClose?: () => void;
}

export function ExpenseForm({ initialData, expenseData, onSuccess, onClose }: ExpenseFormProps) {
  // Use expenseData as fallback for initialData for backwards compatibility
  const dataToUse = initialData || expenseData;
  
  const { 
    formData, 
    setFormData, 
    isSubmitting, 
    handleSubmit, 
    setChartAccountId,
    accountCurrency,
    handleAccountChange,
    handleCurrencyChange,
    handleExchangeRateChange,
    handleOriginalAmountChange
  } = useExpenseForm(dataToUse, () => {
    // Call onSuccess callback if provided - this handles dialog closing
    if (onSuccess) onSuccess();
  });
  const { bankAccounts, chartAccounts, recipients, isLoading } = useExpenseQueries();

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

  // Handle recipient selection with default chart account
  const handleRecipientSelect = (recipientId: string, defaultChartAccountId?: string) => {
    if (defaultChartAccountId) {
      setChartAccountId(defaultChartAccountId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExpenseFormFields
        formData={formData}
        setFormData={setFormData}
        bankAccounts={bankAccounts}
        chartAccounts={chartAccounts}
        recipients={Array.isArray(recipients) ? recipients : []}
        accountCurrency={accountCurrency}
        onRecipientSelect={handleRecipientSelect}
        handleAccountChange={handleAccountChange}
        handleCurrencyChange={handleCurrencyChange}
        handleExchangeRateChange={handleExchangeRateChange}
        handleOriginalAmountChange={handleOriginalAmountChange}
      />

      <div className="flex justify-end space-x-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : dataToUse ? "Actualizar Gasto" : "Crear Gasto"}
        </Button>
      </div>
    </form>
  );
}
