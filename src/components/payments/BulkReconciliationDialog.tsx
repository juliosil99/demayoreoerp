
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ReconciliationConfirmDialog } from "./components/ReconciliationConfirmDialog";
import { usePaymentQueries } from "./hooks/usePaymentQueries";
import { useBulkReconciliation } from "./hooks/useBulkReconciliation";
import { DialogActions } from "./components/DialogActions";
import { BulkReconciliationContent } from "./components/BulkReconciliationContent";

interface BulkReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReconcile: ({ salesIds, paymentId }: { salesIds: number[], paymentId: string }) => void;
}

export function BulkReconciliationDialog({
  open,
  onOpenChange,
  onReconcile,
}: BulkReconciliationDialogProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const { toast } = useToast();
  const { salesChannels } = usePaymentQueries();

  // Use the custom hook to manage the bulk reconciliation state
  const {
    selectedChannel,
    setSelectedChannel,
    orderNumbers,
    setOrderNumbers,
    selectedPaymentId,
    setSelectedPaymentId,
    dateRange,
    setDateRange,
    unreconciled,
    isLoading,
    resetFilters
  } = useBulkReconciliation(open);

  // Reset selected sales when dialog opens or closes
  useEffect(() => {
    if (!open) {
      setSelectedSales([]);
    }
  }, [open]);

  const handleReconcile = () => {
    if (!selectedPaymentId) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un pago para reconciliar.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSales.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos una venta para reconciliar.",
        variant: "destructive",
      });
      return;
    }

    console.log("Iniciando reconciliación:", {
      paymentId: selectedPaymentId,
      salesCount: selectedSales.length,
      salesIds: selectedSales
    });
    
    setShowConfirmDialog(true);
  };

  const confirmReconciliation = async () => {
    console.log("Confirmando reconciliación masiva:", {
      salesIds: selectedSales,
      paymentId: selectedPaymentId
    });
    
    // Realizar la reconciliación
    onReconcile({ salesIds: selectedSales, paymentId: selectedPaymentId });
    
    setShowConfirmDialog(false);
  };

  // Calculate total amount from selected sales
  const totalSelectedAmount = unreconciled
    ? unreconciled
        .filter(sale => selectedSales.includes(sale.id))
        .reduce((sum, sale) => sum + (sale.price || 0), 0)
    : 0;

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Reconciliación Masiva de Ventas</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona un pago y los IDs de las ventas a reconciliar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <BulkReconciliationContent
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            orderNumbers={orderNumbers}
            setOrderNumbers={setOrderNumbers}
            dateRange={dateRange}
            setDateRange={setDateRange}
            resetFilters={resetFilters}
            salesChannels={salesChannels || []}
            selectedPaymentId={selectedPaymentId}
            setSelectedPaymentId={setSelectedPaymentId}
            selectedSales={selectedSales}
            setSelectedSales={setSelectedSales}
            unreconciled={unreconciled}
            isLoading={isLoading}
            isVerifying={false}
            triggerStatus={null}
          />

          <AlertDialogFooter className="mt-4">
            <DialogActions
              onReconcile={handleReconcile}
              isVerifying={false}
              triggerStatus={null}
              showTriggerCheck={false}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReconciliationConfirmDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={confirmReconciliation}
        selectedCount={selectedSales.length}
        totalAmount={totalSelectedAmount}
      />
    </>
  );
}
