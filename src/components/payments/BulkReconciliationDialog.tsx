
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReconciliationFilters } from "./components/ReconciliationFilters";
import { ReconciliationTable } from "./components/ReconciliationTable";
import { PaymentSelector } from "./components/PaymentSelector";
import { useBulkReconciliation } from "./hooks/useBulkReconciliation";
import { useEffect } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface BulkReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReconcile: (data: {
    salesIds: number[];
    paymentId: string;
  }) => void;
}

export function BulkReconciliationDialog({
  open,
  onOpenChange,
  onReconcile,
}: BulkReconciliationDialogProps) {
  const {
    selectedChannel,
    setSelectedChannel,
    orderNumbers,
    setOrderNumbers,
    selectedPaymentId,
    setSelectedPaymentId,
    unreconciled,
    isLoading,
    resetFilters
  } = useBulkReconciliation(open);

  useEffect(() => {
    setSelectedPaymentId(undefined);
  }, [selectedChannel, setSelectedPaymentId]);

  const handleReconcile = () => {
    if (!unreconciled?.length || !selectedPaymentId) return;
    
    onReconcile({
      salesIds: unreconciled.map(sale => sale.id),
      paymentId: selectedPaymentId
    });
  };

  const totalAmount = unreconciled?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
  const hasUnreconciled = unreconciled && unreconciled.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reconciliación Masiva de Ventas</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <PaymentSelector
              selectedPaymentId={selectedPaymentId}
              onPaymentSelect={setSelectedPaymentId}
              selectedChannel={selectedChannel}
            />

            <ReconciliationFilters
              selectedChannel={selectedChannel}
              onChannelChange={setSelectedChannel}
              orderNumbers={orderNumbers}
              onOrderNumbersChange={setOrderNumbers}
            />
          </div>

          {hasUnreconciled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Se encontraron {unreconciled.length} documentos para reconciliar por un total de {formatCurrency(totalAmount)}
              </AlertDescription>
            </Alert>
          )}

          <div className="min-h-[300px]">
            <ReconciliationTable
              sales={unreconciled}
              isLoading={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReconcile}
            disabled={!hasUnreconciled || !selectedPaymentId}
          >
            Reconciliar {unreconciled?.length || 0} Ventas ({formatCurrency(totalAmount)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
