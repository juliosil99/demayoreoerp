
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentFormData } from "../hooks/usePaymentForm";

interface PaymentFormFieldsProps {
  formData: PaymentFormData;
  setFormData: (data: PaymentFormData) => void;
  bankAccounts: any[];
  salesChannels: any[];
}

export function PaymentFormFields({
  formData,
  setFormData,
  bankAccounts,
  salesChannels,
}: PaymentFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Monto</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Canal de Venta</Label>
          <Select
            value={formData.sales_channel_id}
            onValueChange={(value) => setFormData({ ...formData, sales_channel_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar canal" />
            </SelectTrigger>
            <SelectContent>
              {salesChannels?.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cuenta Bancaria</Label>
          <Select
            value={formData.account_id}
            onValueChange={(value) => setFormData({ ...formData, account_id: value })}
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

        <div className="space-y-2">
          <Label>Método de Pago</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="check">Cheque</SelectItem>
              <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Número de Referencia</Label>
          <Input
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={formData.status as "confirmed" | "pending"}
            onValueChange={(value: "confirmed" | "pending") => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notas</Label>
          <Input
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
