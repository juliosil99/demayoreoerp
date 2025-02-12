
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
import { PaymentDetailsForm } from "./components/PaymentDetailsForm";
import { TotalsSummary } from "./components/TotalsSummary";
import { useBulkReconciliation } from "./hooks/useBulkReconciliation";
import { calculateTotals } from "./utils/calculations";

interface BulkReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReconcile: (data: {
    salesIds: number[];
    paymentData: {
      date: string;
      amount: number;
      account_id: number;
      payment_method: string;
      reference_number?: string;
    };
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
    paymentDetails,
    setPaymentDetails,
    bankAccounts,
    unreconciled,
    isLoading
  } = useBulkReconciliation(open);

  const totals = calculateTotals(unreconciled || []);

  const handleReconcile = () => {
    if (!unreconciled?.length) return;
    
    onReconcile({
      salesIds: unreconciled.map(sale => sale.id),
      paymentData: {
        ...paymentDetails,
        amount: totals.total,
        account_id: parseInt(paymentDetails.account_id),
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reconciliación Masiva de Ventas</DialogTitle>
        </DialogHeader>

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

        <PaymentDetailsForm
          paymentDetails={paymentDetails}
          onPaymentDetailsChange={setPaymentDetails}
          bankAccounts={bankAccounts || []}
        />

        <TotalsSummary totals={totals} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReconcile}
            disabled={!unreconciled?.length || !paymentDetails.account_id}
          >
            Reconciliar {unreconciled?.length || 0} Ventas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
