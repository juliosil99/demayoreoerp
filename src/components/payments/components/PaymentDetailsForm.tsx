
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="space-y-4 border p-4 rounded-md bg-muted/30">
      <h3 className="text-lg font-semibold">Detalles de Pago</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de Pago</Label>
          <Input
            type="date"
            value={paymentDetails.date}
            onChange={(e) =>
              onPaymentDetailsChange({
                ...paymentDetails,
                date: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Cuenta Bancaria</Label>
          <Select
            value={paymentDetails.account_id}
            onValueChange={(value) =>
              onPaymentDetailsChange({
                ...paymentDetails,
                account_id: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Método de Pago</Label>
          <Select
            value={paymentDetails.payment_method}
            onValueChange={(value) =>
              onPaymentDetailsChange({
                ...paymentDetails,
                payment_method: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="check">Cheque</SelectItem>
              <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Número de Referencia</Label>
          <Input
            value={paymentDetails.reference_number}
            onChange={(e) =>
              onPaymentDetailsChange({
                ...paymentDetails,
                reference_number: e.target.value,
              })
            }
            placeholder="Número de referencia o concepto"
          />
        </div>
      </div>
    </div>
  );
}
