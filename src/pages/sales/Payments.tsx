
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PaymentFormDialog } from "./components/PaymentFormDialog";
import { PaymentTable } from "./components/PaymentTable";
import { PaymentHeader } from "./components/PaymentHeader";
import { PaymentFilters } from "./components/PaymentFilters";
import { PaymentPagination } from "./components/PaymentPagination";
import { usePaymentsQuery } from "./hooks/usePaymentsQuery";
import { Payment } from "@/components/payments/PaymentForm";
import { usePaymentDelete } from "./hooks/usePaymentDelete";
import { usePaymentStatusUpdate } from "./hooks/usePaymentStatusUpdate";
import { BulkReconciliationDialog } from "@/components/payments/BulkReconciliationDialog";
import { useBulkReconcile } from "./hooks/useBulkReconcile";
import { ReconciledSalesDialog } from "./components/ReconciledSalesDialog";

function Payments() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [reconciledDialogOpen, setReconciledDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const {
    payments,
    isLoading,
    pagination,
    filters,
    updateFilters,
    setPagination,
    refetch,
  } = usePaymentsQuery();

  const { mutateAsync: deletePayment } = usePaymentDelete();
  const { mutateAsync: updatePaymentStatus } = usePaymentStatusUpdate();
  const { mutateAsync: bulkReconcile } = useBulkReconcile();

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pago?")) {
      await deletePayment(id);
      refetch();
    }
  };

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'pending') => {
    await updatePaymentStatus({ id, status });
    refetch();
  };

  const handleFormClose = (shouldRefresh: boolean = false) => {
    setFormOpen(false);
    setSelectedPayment(null);
    if (shouldRefresh) {
      refetch();
    }
  };

  const handleReconcile = async ({ salesIds, paymentId }: { salesIds: number[], paymentId: string }) => {
    await bulkReconcile({ salesIds, paymentId });
    setReconciliationOpen(false);
    refetch();
  };

  const handleViewReconciled = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setReconciledDialogOpen(true);
  };

  const showReconciledFilter = (value: boolean | 'all') => {
    updateFilters({
      ...filters,
      isReconciled: value
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <PaymentHeader onReconcile={() => setReconciliationOpen(true)} />

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between mb-6">
            <PaymentFilters 
              filters={filters} 
              onChangeFilters={updateFilters} 
              onToggleReconciled={showReconciledFilter}
            />
            <Button onClick={() => setFormOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo Pago
            </Button>
          </div>

          <PaymentTable 
            payments={payments} 
            isLoading={isLoading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onStatusUpdate={handleStatusUpdate}
            onViewReconciled={handleViewReconciled}
          />

          <PaymentPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination({ ...pagination, page })}
          />
        </CardContent>
      </Card>

      <PaymentFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        payment={selectedPayment}
      />

      <BulkReconciliationDialog
        open={reconciliationOpen}
        onOpenChange={setReconciliationOpen}
        onReconcile={handleReconcile}
      />

      <ReconciledSalesDialog
        open={reconciledDialogOpen}
        onOpenChange={setReconciledDialogOpen}
        paymentId={selectedPaymentId}
      />
    </div>
  );
}

export default Payments;
