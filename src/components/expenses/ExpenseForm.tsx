import { Button } from "@/components/ui/button";
import { useExpenseForm } from "./hooks/useExpenseForm";
import { useExpenseQueries } from "./hooks/useExpenseQueries";
import { ExpenseFormFields } from "./components/ExpenseFormFields";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, CreditCard, BookOpen, Users } from "lucide-react";
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
    handleOriginalAmountChange,
    handleReturnToggle
  } = useExpenseForm(dataToUse, () => {
    // Call onSuccess callback if provided - this handles dialog closing
    if (onSuccess) onSuccess();
  });
  
  const { 
    bankAccounts, 
    chartAccounts, 
    recipients, 
    isLoading, 
    missingData, 
    hasRequiredData,
    errors 
  } = useExpenseQueries();

  // Show loading state with details
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Cargando datos necesarios...
          {missingData.length > 0 && (
            <div className="mt-2">
              <span className="font-medium">Cargando:</span> {missingData.join(", ")}
            </div>
          )}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Show specific error states
  if (errors.company) {
    return (
      <Alert variant="destructive">
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Error al cargar la información de la empresa. Por favor, verifica tu configuración de empresa en el sistema.
        </AlertDescription>
      </Alert>
    );
  }

  if (errors.bankAccounts && bankAccounts.length === 0) {
    return (
      <Alert variant="destructive">
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las cuentas bancarias. Por favor, verifica que tengas cuentas bancarias configuradas.
        </AlertDescription>
      </Alert>
    );
  }

  if (errors.chartAccounts && chartAccounts.length === 0) {
    return (
      <Alert variant="destructive">
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          Error al cargar el plan contable. Por favor, verifica que tengas cuentas contables configuradas.
        </AlertDescription>
      </Alert>
    );
  }

  // Show specific missing data warnings
  if (!hasRequiredData) {
    const missingItems = [];
    if (bankAccounts.length === 0) missingItems.push("cuentas bancarias");
    if (chartAccounts.length === 0) missingItems.push("cuentas contables");

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>No se encontraron las cuentas necesarias para crear un gasto.</p>
            <p className="font-medium">Faltan: {missingItems.join(" y ")}</p>
            <div className="text-sm text-gray-600 mt-2">
              <p>Para resolver esto:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {bankAccounts.length === 0 && (
                  <li>Ve a "Banca" y agrega al menos una cuenta bancaria</li>
                )}
                {chartAccounts.length === 0 && (
                  <li>Ve a "Plan Contable" y configura cuentas de tipo gasto, activo o pasivo</li>
                )}
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

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
