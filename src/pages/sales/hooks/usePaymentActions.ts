
import { usePaymentDelete } from "./usePaymentDelete";
import { usePaymentStatusUpdate } from "./usePaymentStatusUpdate";
import { useBulkReconcile } from "./useBulkReconcile";
import { useToast } from "@/hooks/use-toast";

export function usePaymentActions(onRefresh: () => void) {
  const { toast } = useToast();
  const { mutateAsync: deletePayment } = usePaymentDelete();
  const { mutateAsync: updatePaymentStatus } = usePaymentStatusUpdate();
  const { mutateAsync: bulkReconcile } = useBulkReconcile();

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pago?")) {
      await deletePayment(id);
      onRefresh();
    }
  };

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'pending') => {
    await updatePaymentStatus({ id, status });
    onRefresh();
  };
  
  const handleReconcile = async ({ salesIds, paymentId }: { salesIds: number[], paymentId: string }) => {
    try {
      const result = await bulkReconcile({ salesIds, paymentId });
      
      // Refrescar los datos después de la reconciliación
      onRefresh();
      
      toast({
        title: "Reconciliación completada",
        description: `${result.reconciled_count} ventas reconciliadas por $${result.reconciled_amount.toLocaleString()}`,
      });
      
    } catch (error) {
      toast({
        title: "Error de reconciliación",
        description: "No se pudo completar la reconciliación.",
        variant: "destructive",
      });
    }
  };

  return {
    handleDelete,
    handleStatusUpdate,
    handleReconcile
  };
}
