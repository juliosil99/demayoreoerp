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
import { SalesSelectionManager } from "./components/SalesSelectionManager";
import { ReconciliationConfirmDialog } from "./components/ReconciliationConfirmDialog";
import { useBulkReconciliation } from "./hooks/useBulkReconciliation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { DiscrepancyAlert } from "./components/DiscrepancyAlert";
import { detectDiscrepancies } from "./utils/discrepancyDetection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    dateRange,
    setDateRange,
    unreconciled,
    isLoading,
    resetFilters
  } = useBulkReconciliation(open);

  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setSelectedPaymentId(undefined);
    setSelectedSales([]);
  }, [selectedChannel, setSelectedPaymentId]);

  useEffect(() => {
    if (!open) {
      setSelectedSales([]);
    }
  }, [open]);

  const handleReconcile = () => {
    if (!selectedSales.length || !selectedPaymentId) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmReconcile = () => {
    onReconcile({
      salesIds: selectedSales,
      paymentId: selectedPaymentId
    });
    setShowConfirmDialog(false);
  };

  const selectedAmount = unreconciled
    ?.filter(sale => selectedSales.includes(sale.id))
    .reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;

  const hasUnreconciled = unreconciled && unreconciled.length > 0;

  // Add payment details query
  const { data: selectedPayment } = useQuery({
    queryKey: ["payment", selectedPaymentId],
    queryFn: async () => {
      if (!selectedPaymentId) return null;
      
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", selectedPaymentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPaymentId,
  });

  // Calculate discrepancies
  const selectedSalesData = unreconciled?.filter(sale => selectedSales.includes(sale.id)) || [];
  const discrepancy = detectDiscrepancies(selectedSalesData, selectedPayment);

  return (
    <>
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
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onReset={resetFilters}
              />
            </div>

            {hasUnreconciled && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Se encontraron {unreconciled.length} documentos para reconciliar
                </AlertDescription>
              </Alert>
            )}

            {discrepancy.hasDiscrepancy && selectedPaymentId && (
              <DiscrepancyAlert discrepancy={discrepancy} />
            )}

            <SalesSelectionManager
              sales={unreconciled}
              selectedSales={selectedSales}
              onSelectionChange={setSelectedSales}
            />

            <div className="min-h-[300px]">
              <ReconciliationTable
                sales={unreconciled}
                isLoading={isLoading}
                selectedSales={selectedSales}
                onSelectSale={(id) => {
                  if (selectedSales.includes(id)) {
                    setSelectedSales(selectedSales.filter(sId => sId !== id));
                  } else {
                    setSelectedSales([...selectedSales, id]);
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReconcile}
              disabled={!selectedSales.length || !selectedPaymentId || discrepancy.hasDiscrepancy}
            >
              Reconciliar {selectedSales.length} Ventas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReconciliationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmReconcile}
        selectedCount={selectedSales.length}
        totalAmount={selectedAmount}
      />
    </>
  );
}
