
import { Button } from "@/components/ui/button";
import { usePaymentForm } from "./hooks/usePaymentForm";
import { usePaymentQueries } from "./hooks/usePaymentQueries";
import { PaymentFormFields } from "./components/PaymentFormFields";

interface PaymentFormProps {
  onSuccess?: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const { formData, setFormData, isSubmitting, handleSubmit } = usePaymentForm({
    onSuccess,
  });
  const { bankAccounts, clients } = usePaymentQueries();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentFormFields
        formData={formData}
        setFormData={setFormData}
        bankAccounts={bankAccounts || []}
        clients={clients || []}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : "Registrar Pago"}
        </Button>
      </div>
    </form>
  );
}
