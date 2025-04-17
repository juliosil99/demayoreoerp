
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Account, FormFieldProps } from "./types";

interface ExchangeRateCardProps extends FormFieldProps {
  fromAccount: Account | null;
  toAccount: Account | null;
  isCrossCurrency: boolean;
}

export function ExchangeRateCard({ 
  formData, 
  setFormData, 
  fromAccount, 
  toAccount, 
  isCrossCurrency 
}: ExchangeRateCardProps) {
  if (!isCrossCurrency) return null;
  
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Cambio ({fromAccount?.currency} a {toAccount?.currency})</Label>
            <Input
              type="number"
              step="0.0001"
              placeholder="Tipo de cambio"
              value={formData.exchange_rate}
              onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Cantidad en destino ({toAccount?.currency})</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount_to}
              onChange={(e) => setFormData({ ...formData, amount_to: e.target.value })}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
