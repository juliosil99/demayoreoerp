
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { BaseFieldProps } from "../types";

export function DateAmountFields({ formData, setFormData }: BaseFieldProps) {
  return (
    <>
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
    </>
  );
}
