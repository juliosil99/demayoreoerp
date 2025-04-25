
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
    isLoading
  } = useBulkReconciliation(open);

  const handleReconcile = () => {
    if (!unreconciled?.length || !selectedPaymentId) return;
    
    onReconcile({
      salesIds: unreconciled.map(sale => sale.id),
      paymentId: selectedPaymentId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reconciliación Masiva de Ventas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

          <ReconciliationTable
            sales={unreconciled}
            isLoading={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReconcile}
            disabled={!unreconciled?.length || !selectedPaymentId}
          >
            Reconciliar {unreconciled?.length || 0} Ventas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
