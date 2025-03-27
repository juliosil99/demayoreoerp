
import { useState } from "react";
import { Payment } from "@/components/payments/PaymentForm";
import { BulkReconciliationDialog } from "@/components/payments/BulkReconciliationDialog";
import { usePaymentsQuery } from "./hooks/usePaymentsQuery";
import { usePaymentDelete } from "./hooks/usePaymentDelete";
import { useBulkReconcile } from "./hooks/useBulkReconcile";
import { PaymentTable } from "./components/PaymentTable";
import { PaymentHeader } from "./components/PaymentHeader";
import { PaymentFormDialog } from "./components/PaymentFormDialog";
import { PaymentPagination } from "./components/PaymentPagination";

type PaymentWithRelations = Payment & {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
};

export default function Payments() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showBulkReconciliation, setShowBulkReconciliation] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: payments, isLoading, totalCount } = usePaymentsQuery({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });
  
  const deletePaymentMutation = usePaymentDelete();
  const bulkReconcileMutation = useBulkReconcile();

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pago?")) {
      deletePaymentMutation.mutate(id);
    }
  };

  const handleEdit = (payment: PaymentWithRelations) => {
    const paymentData: Payment = {
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number,
      sales_channel_id: payment.sales_channel_id,
      account_id: Number(payment.account_id),
      notes: payment.notes,
    };
    setPaymentToEdit(paymentData);
    setIsAddingPayment(true);
  };

  const handleSuccess = () => {
    setIsAddingPayment(false);
    setPaymentToEdit(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PaymentHeader 
        onOpenAddPayment={() => setIsAddingPayment(true)} 
        onOpenBulkReconciliation={() => setShowBulkReconciliation(true)} 
      />

      <PaymentFormDialog
        open={isAddingPayment}
        onOpenChange={setIsAddingPayment}
        paymentToEdit={paymentToEdit}
        onSuccess={handleSuccess}
      />

      <BulkReconciliationDialog 
        open={showBulkReconciliation}
        onOpenChange={setShowBulkReconciliation}
        onReconcile={bulkReconcileMutation.mutate}
      />

      <PaymentTable
        payments={payments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <PaymentPagination
        totalItems={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
