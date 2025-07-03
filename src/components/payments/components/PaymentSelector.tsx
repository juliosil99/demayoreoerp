
import { useOptimizedPaymentsForReconciliation } from "../hooks/useOptimizedPaymentsForReconciliation";
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
  const { data: payments, isLoading } = useOptimizedPaymentsForReconciliation(selectedChannel);

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
