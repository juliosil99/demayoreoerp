
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
  const { data: payments, isLoading } = useQuery({
    queryKey: ["unreconciled-payments", selectedChannel],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select(`
          *,
          bank_accounts (name),
          sales_channels (name)
        `)
        .eq("status", "completed")
        .is("reconciliation_id", null)
        .order("date", { ascending: false });

      if (selectedChannel !== "all") {
        query = query.eq("sales_channel_id", selectedChannel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
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
              {payment.sales_channels?.name || "Sin canal"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
