
import { Payment, PaymentForm } from "@/components/payments/PaymentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentToEdit: Payment | null;
  onSuccess?: () => void;
}

export function PaymentFormDialog({ 
  open, 
  onOpenChange, 
  paymentToEdit, 
  onSuccess 
}: PaymentFormDialogProps) {

  // Create a wrapper function that handles both success and modal closing
  const handleFormSuccess = () => {
    // First execute the onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    // Then close the modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {paymentToEdit ? "Editar Pago" : "Registrar Nuevo Pago"}
          </DialogTitle>
        </DialogHeader>
        <PaymentForm onSuccess={handleFormSuccess} paymentToEdit={paymentToEdit} />
      </DialogContent>
    </Dialog>
  );
}
