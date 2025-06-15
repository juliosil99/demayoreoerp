
import { Container } from "@/components/ui/container";
import { PaymentHeader } from "./components/PaymentHeader";
import { PaymentsContent } from "./components/PaymentsContent";
import { usePaymentsQuery } from "./hooks/usePaymentsQuery";
import { usePaymentActions } from "./hooks/usePaymentActions";
import { PaymentDialogs } from "./components/PaymentDialogs";

function Payments() {
  const {
    payments,
    isLoading,
    pagination,
    filters,
    updateFilters,
    setPagination,
    refetch,
  } = usePaymentsQuery();

  const { handleDelete, handleStatusUpdate, handleReconcile } = usePaymentActions(refetch);
    
  const { dialogs, handlers } = PaymentDialogs({ onReconcile: handleReconcile, onRefresh: refetch });

  return (
    <Container className="py-6 space-y-6">
      <PaymentHeader 
        onOpenBulkReconciliation={handlers.handleReconciliationOpen} 
        onOpenAddPayment={handlers.handleFormOpen} 
      />

      <PaymentsContent
        payments={payments}
        isLoading={isLoading}
        pagination={pagination}
        filters={filters}
        onUpdateFilters={updateFilters}
        setPagination={setPagination}
        onEdit={handlers.handleEdit}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
        onViewReconciled={handlers.handleViewReconciled}
      />

      {dialogs}
    </Container>
  );
}

export default Payments;
