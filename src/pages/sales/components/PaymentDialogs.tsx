
import { useState } from "react";
import { PaymentFormDialog } from "./PaymentFormDialog";
import { BulkReconciliationDialog } from "@/components/payments/BulkReconciliationDialog";
import { ReconciledSalesDialog } from "./ReconciledSalesDialog";
import { Payment } from "@/components/payments/PaymentForm";

interface PaymentDialogsProps {
  onReconcile: ({ salesIds, paymentId }: { salesIds: number[], paymentId: string }) => void;
  onRefresh: () => void;
}

export function PaymentDialogs({ onReconcile, onRefresh }: PaymentDialogsProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [reconciledDialogOpen, setReconciledDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const handleFormOpen = () => {
    setSelectedPayment(null); // Clear any existing payment
    setFormOpen(true);
  };

  const handleReconciliationOpen = () => {
    setReconciliationOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setSelectedPayment(null);
      // Always refresh when closing the form dialog
      onRefresh();
    }
  };

  const handleFormSuccess = () => {
    onRefresh();
  };

  const handleViewReconciled = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setReconciledDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormOpen(true);
  };

  return {
    dialogs: (
      <>
        <PaymentFormDialog
          open={formOpen}
          onOpenChange={handleFormClose}
          paymentToEdit={selectedPayment}
          onSuccess={handleFormSuccess}
        />

        <BulkReconciliationDialog
          open={reconciliationOpen}
          onOpenChange={setReconciliationOpen}
          onReconcile={onReconcile}
        />

        <ReconciledSalesDialog
          open={reconciledDialogOpen}
          onOpenChange={setReconciledDialogOpen}
          paymentId={selectedPaymentId}
        />
      </>
    ),
    handlers: {
      handleFormOpen,
      handleReconciliationOpen,
      handleViewReconciled,
      handleEdit
    }
  };
}
