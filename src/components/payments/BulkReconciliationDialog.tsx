
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentSelector } from "@/components/payments/components/PaymentSelector"; 
import { useToast } from "@/hooks/use-toast";
import { Payment } from "./PaymentForm";
import { ReconciliationFilters } from "./components/ReconciliationFilters";
import { useBulkReconciliation } from "./hooks/useBulkReconciliation";
import { ReconciliationConfirmDialog } from "./components/ReconciliationConfirmDialog";
import { ReconciliationTable } from "./components/ReconciliationTable";
import { usePaymentQueries } from "./hooks/usePaymentQueries";
import { checkReconciliationTriggers, manualRecalculateReconciliation } from "@/integrations/supabase/triggers";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<any>(null);
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
      setTriggerStatus(null);
    } else {
      // Check triggers when dialog opens
      checkTriggers();
    }
  }, [open]);

  const checkTriggers = async () => {
    setIsVerifying(true);
    const result = await checkReconciliationTriggers();
    setTriggerStatus(result);
    setIsVerifying(false);
    
    if (!result.success) {
      toast({
        title: "Advertencia",
        description: "No se pudieron verificar los triggers de reconciliación. El proceso de reconciliación puede no funcionar correctamente.",
        variant: "destructive",
      });
    } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
      toast({
        title: "Advertencia",
        description: "Faltan algunos triggers de reconciliación. Se utilizará un método alternativo de cálculo.",
        variant: "default",
      });
    }
  };

  const handleSelectSale = (id: number) => {
    setSelectedSales(prev => 
      prev.includes(id) 
        ? prev.filter(saleId => saleId !== id) 
        : [...prev, id]
    );
  };

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
              {isVerifying && <span className="block mt-2 text-amber-500">Verificando configuración de reconciliación...</span>}
              {triggerStatus && !triggerStatus.success && 
                <span className="block mt-2 text-red-500">
                  Advertencia: No se pudieron verificar los triggers de la base de datos.
                </span>
              }
              {triggerStatus && triggerStatus.success && !triggerStatus.hasPaymentTrigger && 
                <span className="block mt-2 text-amber-500">
                  Advertencia: No se encontró el trigger de actualización de pagos. Se usará un método alternativo.
                </span>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ReconciliationFilters
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
            orderNumbers={orderNumbers}
            onOrderNumbersChange={setOrderNumbers}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={resetFilters}
            salesChannels={salesChannels || []}
          />

          <div className="my-4">
            <Label className="mb-2 block font-medium">Seleccionar Pago</Label>
            <PaymentSelector
              selectedPaymentId={selectedPaymentId}
              onPaymentSelect={setSelectedPaymentId}
              selectedChannel={selectedChannel}
            />
          </div>

          <div className="my-4">
            <Label className="mb-2 block font-medium" htmlFor="salesIds">IDs de Ventas (separados por comas)</Label>
            <Input
              id="salesIds"
              placeholder="Ej: 123,456,789"
              onChange={(e) => {
                const ids = e.target.value
                  .split(",")
                  .map((id) => parseInt(id.trim(), 10))
                  .filter((id) => !isNaN(id));
                setSelectedSales(ids);
              }}
            />
          </div>

          {unreconciled && unreconciled.length > 0 && (
            <ReconciliationTable 
              sales={unreconciled}
              isLoading={isLoading}
              selectedSales={selectedSales}
              onSelectSale={handleSelectSale}
            />
          )}

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReconcile}>
              {triggerStatus && (!triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger) 
                ? "Reconciliar (modo manual)" 
                : "Reconciliar"}
            </AlertDialogAction>
            {triggerStatus && (!triggerStatus.success || !triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger) && (
              <Button 
                variant="outline" 
                className="ml-2" 
                onClick={checkTriggers}
                disabled={isVerifying}
              >
                Verificar DB
              </Button>
            )}
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
