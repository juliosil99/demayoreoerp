
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldProps } from "./types";

export function DateAmountFields({ formData, setFormData }: FormFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Fecha</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Cantidad desde origen</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount_from}
          onChange={(e) => setFormData({ ...formData, amount_from: e.target.value })}
          required
        />
      </div>
    </div>
  );
}
