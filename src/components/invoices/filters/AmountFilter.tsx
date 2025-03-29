
import React from "react";
import { DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AmountFilterProps {
  minAmount: string;
  maxAmount: string;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
}

export const AmountFilter: React.FC<AmountFilterProps> = ({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
}) => {
  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMinAmountChange(e.target.value);
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMaxAmountChange(e.target.value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="minAmount">Monto mínimo</Label>
        <div className="relative">
          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="minAmount"
            name="minAmount"
            type="number"
            placeholder="Monto mínimo"
            value={minAmount}
            onChange={handleMinAmountChange}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxAmount">Monto máximo</Label>
        <div className="relative">
          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="maxAmount"
            name="maxAmount"
            type="number"
            placeholder="Monto máximo"
            value={maxAmount}
            onChange={handleMaxAmountChange}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
};
