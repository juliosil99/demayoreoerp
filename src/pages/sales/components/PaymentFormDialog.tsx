
import { Payment, PaymentForm } from "@/components/payments/PaymentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  console.log("PaymentFormDialog rendered:", { open, hasPaymentToEdit: !!paymentToEdit, hasOnSuccess: !!onSuccess });

  // Create a wrapper function that handles both success and modal closing
  const handleFormSuccess = () => {
    console.log("PaymentFormDialog: handleFormSuccess called");
    
    // First execute the onSuccess callback if provided
    if (onSuccess) {
      console.log("PaymentFormDialog: Executing onSuccess callback");
      onSuccess();
    }
    
    // Then close the modal
    console.log("PaymentFormDialog: Closing modal");
    onOpenChange(false);
    
    console.log("PaymentFormDialog: Modal close requested");
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
