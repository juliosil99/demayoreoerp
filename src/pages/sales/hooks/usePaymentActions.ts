
import { usePaymentDelete } from "./usePaymentDelete";
import { usePaymentStatusUpdate } from "./usePaymentStatusUpdate";
import { useBulkReconcile } from "./useBulkReconcile";
import { Payment } from "@/components/payments/PaymentForm";
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
    console.log(`Starting reconciliation of ${salesIds.length} sales with payment ${paymentId}`);
    
    try {
      const result = await bulkReconcile({ salesIds, paymentId });
      console.log("Reconciliation result:", result);
      onRefresh();
    } catch (error) {
      console.error("Error en reconciliación:", error);
      toast({
        title: "Error de reconciliación",
        description: "Se produjo un error durante el proceso de reconciliación. Consulte la consola para más detalles.",
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
