
import { Container } from "@/components/ui/container";
import { PaymentHeader } from "./components/PaymentHeader";
import { PaymentsContent } from "./components/PaymentsContent";
import { useOptimizedPaymentsQuery } from "./hooks/useOptimizedPaymentsQuery";
import { usePaymentActions } from "./hooks/usePaymentActions";
import { PaymentDialogs } from "./components/PaymentDialogs";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function Payments() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    search: '',
    date: undefined,
    paymentMethod: 'all' as const,
    isReconciled: 'all' as const,
  });

  const {
    payments,
    totalCount,
    isLoading,
    error,
  } = useOptimizedPaymentsQuery(filters, pagination);

  // Calculate total pages from totalCount
  const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));
  const paginationWithTotal = { ...pagination, totalPages };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["optimized-payments"] });
    queryClient.invalidateQueries({ queryKey: ["optimized-payments-reconciliation"] });
  };

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
        pagination={paginationWithTotal}
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
