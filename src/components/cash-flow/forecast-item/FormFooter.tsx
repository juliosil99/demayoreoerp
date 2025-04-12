
import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormFooterProps {
  onCancel: () => void;
  isEditing: boolean;
}

export function FormFooter({ onCancel, isEditing }: FormFooterProps) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEditing ? 'Actualizar' : 'Agregar'}
      </Button>
    </DialogFooter>
  );
}
