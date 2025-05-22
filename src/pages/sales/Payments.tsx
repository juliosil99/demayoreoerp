
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";
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
import { checkReconciliationTriggers, manualRecalculateReconciliation } from "@/integrations/supabase/triggers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

function Payments() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [reconciledDialogOpen, setReconciledDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [triggerStatus, setTriggerStatus] = useState<any>(null);
  const [isVerifyingDatabase, setIsVerifyingDatabase] = useState(false);

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

  // Perform a system check when component loads
  useEffect(() => {
    verifyDatabaseConfiguration();
  }, []);

  const verifyDatabaseConfiguration = async () => {
    setIsVerifyingDatabase(true);
    try {
      const result = await checkReconciliationTriggers();
      setTriggerStatus(result);
      
      if (!result.success) {
        toast({
          title: "Advertencia del sistema",
          description: "No se pudieron verificar los triggers de reconciliación en la base de datos",
          variant: "destructive",
        });
      } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
        toast({
          title: "Advertencia de configuración",
          description: "La configuración de reconciliación automática no está completa",
          variant: "warning",
        });
        
        // Check reconciled payments that might need recalculation
        const paymentIds = payments
          ?.filter(p => p.is_reconciled && (!p.reconciled_amount || p.reconciled_amount === 0))
          .map(p => p.id);
          
        if (paymentIds && paymentIds.length > 0) {
          toast({
            title: "Reparación disponible",
            description: `Se encontraron ${paymentIds.length} pagos reconciliados con montos incorrectos que pueden ser reparados`,
            variant: "warning",
          });
        }
      }
    } catch (error) {
      console.error("Error verificando configuración:", error);
    } finally {
      setIsVerifyingDatabase(false);
    }
  };

  const handleRepairReconciliations = async () => {
    try {
      const paymentIds = payments
        ?.filter(p => p.is_reconciled && (!p.reconciled_amount || p.reconciled_amount === 0))
        .map(p => p.id) || [];
        
      if (paymentIds.length === 0) {
        toast({
          title: "Información",
          description: "No hay pagos reconciliados que necesiten reparación",
        });
        return;
      }
      
      toast({
        title: "Reparación iniciada",
        description: `Reparando ${paymentIds.length} pagos...`,
      });
      
      let repaired = 0;
      for (const paymentId of paymentIds) {
        const result = await manualRecalculateReconciliation(paymentId);
        if (result.success) repaired++;
      }
      
      toast({
        title: "Reparación completada",
        description: `Se repararon ${repaired} pagos de ${paymentIds.length}`,
        variant: "success",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error("Error reparando reconciliaciones:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error durante la reparación",
        variant: "destructive",
      });
    }
  };

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
    console.log(`Starting reconciliation of ${salesIds.length} sales with payment ${paymentId}`);
    
    try {
      const result = await bulkReconcile({ salesIds, paymentId });
      console.log("Reconciliation result:", result);
      setReconciliationOpen(false);
      refetch();
    } catch (error) {
      console.error("Error en reconciliación:", error);
      toast({
        title: "Error de reconciliación",
        description: "Se produjo un error durante el proceso de reconciliación. Consulte la consola para más detalles.",
        variant: "destructive",
      });
    }
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
      <PaymentHeader 
        onOpenBulkReconciliation={() => setReconciliationOpen(true)} 
        onOpenAddPayment={() => setFormOpen(true)} 
      />
      
      {triggerStatus && (!triggerStatus.success || !triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger) && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Advertencia: La configuración de reconciliación automática no está completa. 
              Las reconciliaciones pueden requerir reparación manual.
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={verifyDatabaseConfiguration}
                disabled={isVerifyingDatabase}
              >
                Verificar
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRepairReconciliations}
                disabled={isVerifyingDatabase}
              >
                Reparar reconciliaciones
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
        paymentToEdit={selectedPayment}
        onSuccess={() => refetch()}
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
