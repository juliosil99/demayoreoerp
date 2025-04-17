
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldProps } from "./types";

export function ReferenceFields({ formData, setFormData }: FormFieldProps) {
  return (
    <>
      <div>
        <Label>Número de Referencia</Label>
        <Input
          value={formData.reference_number}
          onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          placeholder="Número de referencia (opcional)"
        />
      </div>

      <div>
        <Label>Notas</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales (opcional)"
        />
      </div>
    </>
  );
}
