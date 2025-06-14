
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PartialInvoice = Partial<Database["public"]["Tables"]["invoices"]["Row"]>;

interface ManualReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: PartialInvoice | null;
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
}

export const ManualReconciliationDialog: React.FC<ManualReconciliationDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  onConfirm,
  isLoading,
}) => {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNotes("");
    onOpenChange(false);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Marcar como Reconciliada
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres marcar esta factura como reconciliada manualmente?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium">Factura: {invoice.invoice_number || "Sin número"}</p>
            <p className="text-sm text-gray-600">
              Emisor: {invoice.issuer_name || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              Total: ${invoice.total_amount?.toLocaleString() || "0"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notas (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Explica por qué marcas esta factura como reconciliada..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              <strong>Importante:</strong> Esta acción marcará la factura como reconciliada sin asociarla a un gasto específico. 
              Úsala únicamente para facturas de períodos anteriores que necesites limpiar.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Marcando..." : "Marcar como Reconciliada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
