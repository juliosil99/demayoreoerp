
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

  console.log("PaymentDialogs state:", { formOpen, hasSelectedPayment: !!selectedPayment });

  const handleFormOpen = () => {
    console.log("PaymentDialogs: handleFormOpen called");
    setSelectedPayment(null); // Clear any existing payment
    setFormOpen(true);
    console.log("PaymentDialogs: Form dialog opened");
  };

  const handleReconciliationOpen = () => {
    console.log("PaymentDialogs: handleReconciliationOpen called");
    setReconciliationOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    console.log("PaymentDialogs: handleFormClose called with open:", open);
    setFormOpen(open);
    if (!open) {
      console.log("PaymentDialogs: Clearing selected payment and refreshing data");
      setSelectedPayment(null);
      // Always refresh when closing the form dialog
      onRefresh();
    }
  };

  const handleFormSuccess = () => {
    console.log("PaymentDialogs: handleFormSuccess called - refreshing data");
    onRefresh();
  };

  const handleViewReconciled = (paymentId: string) => {
    console.log("PaymentDialogs: handleViewReconciled called for payment:", paymentId);
    setSelectedPaymentId(paymentId);
    setReconciledDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    console.log("PaymentDialogs: handleEdit called for payment:", payment.id);
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
