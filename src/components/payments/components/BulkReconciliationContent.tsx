
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentSelector } from "@/components/payments/components/PaymentSelector";
import { TriggerStatusAlert } from "./TriggerStatusAlert";
import { ReconciliationFilters } from "./ReconciliationFilters";
import { ReconciliationTable } from "./ReconciliationTable";
import { ReconciliationCalculator } from "./ReconciliationCalculator";

interface PaymentAdjustment {
  id: string;
  type: 'commission' | 'shipping' | 'other';
  amount: number;
  description: string;
}

interface BulkReconciliationContentProps {
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  orderNumbers: string;
  setOrderNumbers: (orders: string) => void;
  dateRange: any;
  setDateRange: (range: any) => void;
  resetFilters: () => void;
  salesChannels: any[];
  selectedPaymentId: string | undefined;
  setSelectedPaymentId: (id: string) => void;
  selectedSales: number[];
  setSelectedSales: (ids: number[] | ((prev: number[]) => number[])) => void;
  unreconciled: any[] | undefined;
  isLoading: boolean;
  isVerifying: boolean;
  triggerStatus: any;
  adjustments: PaymentAdjustment[];
  onAdjustmentAdd: (adjustment: Omit<PaymentAdjustment, 'id'>) => void;
  onAdjustmentRemove: (id: string) => void;
  error?: Error | null;
}

export function BulkReconciliationContent({
  selectedChannel,
  setSelectedChannel,
  orderNumbers,
  setOrderNumbers,
  dateRange,
  setDateRange,
  resetFilters,
  salesChannels,
  selectedPaymentId,
  setSelectedPaymentId,
  selectedSales,
  setSelectedSales,
  unreconciled,
  isLoading,
  isVerifying,
  triggerStatus,
  adjustments,
  onAdjustmentAdd,
  onAdjustmentRemove,
  error
}: BulkReconciliationContentProps) {
  const { toast } = useToast();

  // Fetch payment data when a payment is selected
  const { data: selectedPayment } = useQuery({
    queryKey: ["payment-details", selectedPaymentId],
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
    enabled: !!selectedPaymentId
  });

  const handleSelectSale = (id: number) => {
    setSelectedSales(prev => 
      prev.includes(id) 
        ? prev.filter(saleId => saleId !== id) 
        : [...prev, id]
    );
  };

  const handleIdsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ids = e.target.value
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));
    setSelectedSales(ids);
  };

  // Calculate selected orders total
  const selectedOrdersTotal = unreconciled
    ? unreconciled
        .filter(sale => selectedSales.includes(sale.id))
        .reduce((sum, sale) => sum + (sale.price || 0), 0)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Filters and Selection */}
      <div className="space-y-4">
        <ReconciliationFilters
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
          orderNumbers={orderNumbers}
          onOrderNumbersChange={setOrderNumbers}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onReset={resetFilters}
          salesChannels={salesChannels || []}
          isLoading={isLoading}
          error={error}
        />

        <div>
          <Label className="mb-2 block font-medium">Seleccionar Pago</Label>
          <PaymentSelector
            selectedPaymentId={selectedPaymentId}
            onPaymentSelect={setSelectedPaymentId}
            selectedChannel={selectedChannel}
          />
        </div>

        <div>
          <Label className="mb-2 block font-medium" htmlFor="salesIds">IDs de Ventas (separados por comas)</Label>
          <Input
            id="salesIds"
            placeholder="Ej: 123,456,789"
            onChange={handleIdsInput}
          />
        </div>

        <TriggerStatusAlert 
          isVerifying={isVerifying} 
          triggerStatus={triggerStatus} 
        />

        {unreconciled && unreconciled.length > 0 && (
          <ReconciliationTable 
            sales={unreconciled}
            isLoading={isLoading}
            selectedSales={selectedSales}
            onSelectSale={handleSelectSale}
          />
        )}
      </div>

      {/* Right Column - Calculator */}
      <div>
        {selectedPaymentId && selectedPayment && (
          <ReconciliationCalculator
            selectedOrdersTotal={selectedOrdersTotal}
            paymentAmount={selectedPayment.amount || 0}
            adjustments={adjustments}
            onAdjustmentAdd={onAdjustmentAdd}
            onAdjustmentRemove={onAdjustmentRemove}
          />
        )}
      </div>
    </div>
  );
}
