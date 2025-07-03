
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface PaymentSelectorProps {
  selectedPaymentId?: string;
  onPaymentSelect: (id: string) => void;
  selectedChannel: string;
}

export function PaymentSelector({
  selectedPaymentId,
  onPaymentSelect,
  selectedChannel,
}: PaymentSelectorProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments-for-reconciliation", selectedChannel],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select(`
          id,
          date,
          amount,
          reference_number,
          sales_channels(name)
        `)
        .eq("is_reconciled", false)
        .order("date", { ascending: false });
      
      // Apply channel filter if not "all"
      if (selectedChannel !== "all") {
        query = query.eq("sales_channel_id", selectedChannel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Cargando pagos..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={selectedPaymentId} onValueChange={onPaymentSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar un pago" />
      </SelectTrigger>
      <SelectContent>
        {payments?.length ? (
          payments.map((payment) => (
            <SelectItem key={payment.id} value={payment.id}>
              {formatDateForDisplay(payment.date)} - {payment.reference_number || "Sin referencia"} - ${payment.amount.toFixed(2)} {payment.sales_channels?.name ? `(${payment.sales_channels.name})` : ""}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled>
            No hay pagos disponibles
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
