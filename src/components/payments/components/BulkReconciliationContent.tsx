
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PaymentSelector } from "@/components/payments/components/PaymentSelector";
import { TriggerStatusAlert } from "./TriggerStatusAlert";
import { ReconciliationFilters } from "./ReconciliationFilters";
import { ReconciliationTable } from "./ReconciliationTable";

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
  triggerStatus
}: BulkReconciliationContentProps) {
  const { toast } = useToast();

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

  return (
    <>
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
    </>
  );
}
