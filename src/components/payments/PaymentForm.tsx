
import { Button } from "@/components/ui/button";
import { usePaymentForm } from "./hooks/usePaymentForm";
import { usePaymentQueries } from "./hooks/usePaymentQueries";
import { PaymentFormFields } from "./components/PaymentFormFields";

export type Payment = {
  id: string;
  date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  client_id?: string;
  account_id: number;  // Cambiado de string a number
  notes?: string;
};

interface PaymentFormProps {
  onSuccess?: () => void;
  paymentToEdit?: Payment | null;
}

export function PaymentForm({ onSuccess, paymentToEdit }: PaymentFormProps) {
  const { formData, setFormData, isSubmitting, handleSubmit } = usePaymentForm({
    onSuccess,
    paymentToEdit,
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
          {isSubmitting ? "Procesando..." : paymentToEdit ? "Actualizar Pago" : "Registrar Pago"}
        </Button>
      </div>
    </form>
  );
}
