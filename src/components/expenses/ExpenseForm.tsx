
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
  console.log("💼 ExpenseForm: Component rendered");
  
  // Use expenseData as fallback for initialData for backwards compatibility
  const dataToUse = initialData || expenseData;
  console.log("💼 ExpenseForm: Using data:", dataToUse?.id ? "editing existing" : "creating new");
  
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
    handleOriginalAmountChange,
    handleReturnToggle
  } = useExpenseForm(dataToUse, () => {
    // Call onSuccess callback if provided - this handles dialog closing
    if (onSuccess) onSuccess();
  });
  
  console.log("💼 ExpenseForm: Form state:", { isSubmitting, accountCurrency });
  
  const { bankAccounts, chartAccounts, recipients, isLoading } = useExpenseQueries();
  
  console.log("💼 ExpenseForm: Received from useExpenseQueries:", {
    bankAccountsCount: bankAccounts?.length || 0,
    chartAccountsCount: chartAccounts?.length || 0,
    recipientsCount: recipients?.length || 0,
    isLoading,
    bankAccountsType: Array.isArray(bankAccounts),
    chartAccountsType: Array.isArray(chartAccounts),
    recipientsType: Array.isArray(recipients)
  });

  if (isLoading) {
    console.log("💼 ExpenseForm: Showing loading state");
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
    console.error("💼 ExpenseForm: Missing required data:", {
      bankAccounts: { isArray: Array.isArray(bankAccounts), length: bankAccounts?.length || 0 },
      chartAccounts: { isArray: Array.isArray(chartAccounts), length: chartAccounts?.length || 0 }
    });
    return <div className="text-center p-4">No se encontraron las cuentas necesarias.</div>;
  }

  console.log("💼 ExpenseForm: Rendering form with valid data");

  // Handle recipient selection with default chart account
  const handleRecipientSelect = (recipientId: string, defaultChartAccountId?: string) => {
    if (defaultChartAccountId) {
      setChartAccountId(defaultChartAccountId);
    }
  };

  // Determine label based on if this is a return
  const submitButtonText = isSubmitting 
    ? "Guardando..." 
    : dataToUse 
      ? (formData.isReturn ? "Actualizar Reembolso" : "Actualizar Gasto")
      : (formData.isReturn ? "Crear Reembolso" : "Crear Gasto");

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
        handleReturnToggle={handleReturnToggle}
      />

      <div className="flex justify-end space-x-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
