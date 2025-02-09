
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentDetailsFormProps {
  paymentDetails: {
    date: string;
    account_id: string;
    payment_method: string;
    reference_number: string;
  };
  onPaymentDetailsChange: (details: any) => void;
  bankAccounts: any[];
}

export function PaymentDetailsForm({
  paymentDetails,
  onPaymentDetailsChange,
  bankAccounts,
}: PaymentDetailsFormProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <Label>Fecha de Pago</Label>
        <Input
          type="date"
          value={paymentDetails.date}
          onChange={(e) => onPaymentDetailsChange({ ...paymentDetails, date: e.target.value })}
        />
      </div>
      <div>
        <Label>Cuenta</Label>
        <Select
          value={paymentDetails.account_id}
          onValueChange={(value) => onPaymentDetailsChange({ ...paymentDetails, account_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            {bankAccounts?.map((account) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Método de Pago</Label>
        <Select
          value={paymentDetails.payment_method}
          onValueChange={(value) => onPaymentDetailsChange({ ...paymentDetails, payment_method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="check">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Referencia</Label>
        <Input
          value={paymentDetails.reference_number}
          onChange={(e) => onPaymentDetailsChange({ ...paymentDetails, reference_number: e.target.value })}
          placeholder="Número de referencia"
        />
      </div>
    </div>
  );
}
