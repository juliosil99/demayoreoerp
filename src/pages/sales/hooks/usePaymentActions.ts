
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
    console.log(`Ejecutando reconciliación: ${salesIds.length} ventas con pago ${paymentId}`);
    
    try {
      const result = await bulkReconcile({ salesIds, paymentId });
      console.log("Reconciliación exitosa:", result);
      
      // Refrescar los datos después de la reconciliación
      onRefresh();
      
      toast({
        title: "Reconciliación completada",
        description: `${result.reconciled_count} ventas reconciliadas por $${result.reconciled_amount.toLocaleString()}`,
      });
      
    } catch (error) {
      console.error("Error en reconciliación:", error);
      toast({
        title: "Error de reconciliación",
        description: "No se pudo completar la reconciliación. Consulta la consola para más detalles.",
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
