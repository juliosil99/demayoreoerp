
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
import { manualRecalculateReconciliation } from "@/integrations/supabase/triggers";
import { ReconciliationConfirmDialog } from "./components/ReconciliationConfirmDialog";
import { usePaymentQueries } from "./hooks/usePaymentQueries";
import { useBulkReconciliation } from "./hooks/useBulkReconciliation";
import { useTriggerVerification } from "./hooks/useTriggerVerification";
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
  const { isVerifying, triggerStatus, checkTriggers, setTriggerStatus } = useTriggerVerification();

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
      setTriggerStatus(null);
    } else {
      // Check triggers when dialog opens
      checkTriggers();
    }
  }, [open, checkTriggers, setTriggerStatus]);

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

    console.log("Trigger status before reconciliation:", triggerStatus);
    setShowConfirmDialog(true);
  };

  const confirmReconciliation = async () => {
    // Perform the reconciliation
    onReconcile({ salesIds: selectedSales, paymentId: selectedPaymentId });
    
    // If triggers appear to be missing, use manual calculation as a fallback
    if (triggerStatus && (!triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger)) {
      console.log("Using manual reconciliation fallback due to missing triggers");
      
      // Allow some time for the initial reconciliation to complete
      setTimeout(async () => {
        const result = await manualRecalculateReconciliation(selectedPaymentId);
        if (result.success) {
          toast({
            title: "Reconciliación manual completada",
            description: `Reconciliación: ${result.reconciled_count} ventas por ${result.reconciled_amount}`,
          });
        }
      }, 2000);
    }
    
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
            isVerifying={isVerifying}
            triggerStatus={triggerStatus}
          />

          <AlertDialogFooter className="mt-4">
            <DialogActions
              onReconcile={handleReconcile}
              checkTriggers={checkTriggers}
              isVerifying={isVerifying}
              triggerStatus={triggerStatus}
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
