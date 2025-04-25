
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface PaymentSelectorProps {
  selectedPaymentId?: string;
  onPaymentSelect: (paymentId: string) => void;
  selectedChannel: string;
}

export function PaymentSelector({
  selectedPaymentId,
  onPaymentSelect,
  selectedChannel,
}: PaymentSelectorProps) {
  const [paymentsExist, setPaymentsExist] = useState(true);

  const { data: payments, isLoading } = useQuery({
    queryKey: ["unreconciled-payments", selectedChannel],
    queryFn: async () => {
      console.log("Fetching payments for channel:", selectedChannel);
      
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          date,
          status,
          sales_channel_id,
          reference_number,
          bank_accounts (name),
          sales_channels (name)
        `)
        .eq("status", "completed");

      // We want payments without reconciled sales or with some sales not reconciled
      if (selectedChannel !== "all") {
        query = query.eq("sales_channel_id", selectedChannel);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }
      
      console.log("Fetched payments:", data);
      return data;
    },
    enabled: true,
  });

  useEffect(() => {
    setPaymentsExist(Boolean(payments?.length));
  }, [payments]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!paymentsExist) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Seleccionar Pago</label>
        <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center text-sm text-muted-foreground">
          No hay pagos disponibles para reconciliar
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Seleccionar Pago</label>
      <Select value={selectedPaymentId} onValueChange={onPaymentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un pago..." />
        </SelectTrigger>
        <SelectContent>
          {payments?.map((payment) => (
            <SelectItem key={payment.id} value={payment.id}>
              ${payment.amount.toFixed(2)} - {payment.date} - 
              {payment.reference_number ? ` Ref: ${payment.reference_number} - ` : ''}
              {payment.sales_channels?.name || "Sin canal"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
