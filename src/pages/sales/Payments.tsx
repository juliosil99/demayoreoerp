
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { PaymentHeader } from "./components/PaymentHeader";
import { PaymentsContent } from "./components/PaymentsContent";
import { SystemStatusAlert } from "./components/SystemStatusAlert";
import { usePaymentsQuery } from "./hooks/usePaymentsQuery";
import { usePaymentActions } from "./hooks/usePaymentActions";
import { useSystemVerification } from "./hooks/useSystemVerification";
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

  const { triggerStatus, isVerifyingDatabase, verifyDatabaseConfiguration, handleRepairReconciliations } = 
    useSystemVerification(payments);
    
  const { dialogs, handlers } = PaymentDialogs({ onReconcile: handleReconcile, onRefresh: refetch });

  return (
    <Container className="py-6 space-y-6">
      <PaymentHeader 
        onOpenBulkReconciliation={handlers.handleReconciliationOpen} 
        onOpenAddPayment={handlers.handleFormOpen} 
      />
      
      <SystemStatusAlert 
        triggerStatus={triggerStatus}
        isVerifyingDatabase={isVerifyingDatabase}
        onVerify={verifyDatabaseConfiguration}
        onRepair={handleRepairReconciliations}
      />

      <PaymentsContent
        payments={payments}
        isLoading={isLoading}
        pagination={pagination}
        filters={filters}
        onUpdateFilters={updateFilters}
        setPagination={setPagination}
        onOpenAddPayment={handlers.handleFormOpen}
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
