
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReconciliationConfirmDialog } from "./components/ReconciliationConfirmDialog";
import { useOptimizedPaymentQueries } from "./hooks/useOptimizedPaymentQueries";
import { usePaymentReconciliation } from "./hooks/usePaymentReconciliation";
import { useOptimizedUnreconciledSales } from "./hooks/useOptimizedUnreconciledSales";
import { DialogActions } from "./components/DialogActions";
import { BulkReconciliationContent } from "./components/BulkReconciliationContent";
import type { UnreconciledSale } from "./types/UnreconciledSale";
import { formatDateForQuery } from "@/utils/dateUtils";

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
  const { toast } = useToast();
  const { salesChannels, isLoading: queriesLoading, error: queriesError } = useOptimizedPaymentQueries();

  // Local state for bulk reconciliation (moved from hook)
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [orderNumbers, setOrderNumbers] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange>();

  // Use the payment reconciliation hook for adjustments
  const {
    selectedSales,
    setSelectedSales,
    adjustments,
    addAdjustment,
    removeAdjustment,
    resetReconciliation,
    reconcilePayment,
    isReconciling
  } = usePaymentReconciliation();

  // Reset filters function
  const resetFilters = () => {
    setSelectedChannel("all");
    setOrderNumbers("");
    setDateRange(undefined);
    setSelectedPaymentId(undefined);
  };

  // Use optimized hook for unreconciled sales
  const { data: unreconciled, isLoading } = useOptimizedUnreconciledSales({
    selectedChannel,
    orderNumbers,
    dateRange,
    enabled: open,
  });

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      resetReconciliation();
      resetFilters();
    }
  }, [open, resetReconciliation]);

  const handleReconcile = async () => {
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

    // Calculate totals and validate balance
    const selectedOrdersTotal = unreconciled
      ? unreconciled
          .filter(sale => selectedSales.includes(sale.id))
          .reduce((sum, sale) => sum + (sale.price || 0), 0)
      : 0;

    const adjustmentsTotal = adjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const finalTotal = selectedOrdersTotal + adjustmentsTotal;

    // Get payment amount
    const { data: paymentData } = await supabase
      .from("payments")
      .select("amount")
      .eq("id", selectedPaymentId)
      .single();

    if (!paymentData) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del pago.",
        variant: "destructive",
      });
      return;
    }

    const difference = Math.abs(finalTotal - paymentData.amount);
    if (difference >= 0.01) {
      toast({
        title: "Error de Balance",
        description: `La reconciliación no está balanceada. Diferencia: ${difference.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmReconciliation = async () => {
    if (selectedPaymentId) {
      reconcilePayment({ salesIds: selectedSales, paymentId: selectedPaymentId });
      setShowConfirmDialog(false);
      onOpenChange(false);
    }
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
        <AlertDialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Reconciliación Masiva de Ventas</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona un pago y los IDs de las ventas a reconciliar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end gap-2 mb-4">
            <DialogActions
              onReconcile={handleReconcile}
              isVerifying={false}
              triggerStatus={null}
              showTriggerCheck={false}
            />
          </div>

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
            isLoading={isLoading || queriesLoading}
            isVerifying={false}
            error={queriesError}
            triggerStatus={null}
            adjustments={adjustments}
            onAdjustmentAdd={addAdjustment}
            onAdjustmentRemove={removeAdjustment}
          />
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
