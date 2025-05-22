
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

    setShowConfirmDialog(true);
  };

  const confirmReconciliation = () => {
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

          <ReconciliationFilters
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
            orderNumbers={orderNumbers}
            onOrderNumbersChange={setOrderNumbers}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={resetFilters}
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
            <AlertDialogAction onClick={handleReconcile}>Reconciliar</AlertDialogAction>
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
