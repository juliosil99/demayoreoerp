
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {paymentToEdit ? "Editar Pago" : "Registrar Nuevo Pago"}
          </DialogTitle>
        </DialogHeader>
        <PaymentForm onSuccess={onSuccess} paymentToEdit={paymentToEdit} />
      </DialogContent>
    </Dialog>
  );
}
