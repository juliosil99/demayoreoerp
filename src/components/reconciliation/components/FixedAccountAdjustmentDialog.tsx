
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { ADJUSTMENT_ACCOUNTS } from "../constants";

type AdjustmentType = "expense_excess" | "invoice_excess";

interface FixedAccountAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  type: AdjustmentType;
  onConfirm: (chartAccountId: string, notes: string) => void;
}

export function FixedAccountAdjustmentDialog({
  open,
  onOpenChange,
  amount,
  type,
  onConfirm,
}: FixedAccountAdjustmentDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const isPerfectMatch = Math.abs(amount) <= 0.01;

  // Usar las cuentas correctas según el tipo de ajuste
  const getAdjustmentAccount = () => {
    if (type === "expense_excess") {
      return ADJUSTMENT_ACCOUNTS.expense_excess;
    } else {
      return ADJUSTMENT_ACCOUNTS.invoice_excess;
    }
  };

  const adjustmentAccount = getAdjustmentAccount();

  const handleConfirm = () => {
    if (!isPerfectMatch && !selectedAccountId) {
      return;
    }
    
    // Para ajustes, usar la cuenta específica del tipo de ajuste
    const accountToUse = isPerfectMatch ? "" : (selectedAccountId || adjustmentAccount.code);
    
    onConfirm(accountToUse, notes);
    setSelectedAccountId("");
    setNotes("");
  };

  const getDialogTitle = (): string => {
    return isPerfectMatch ? "Confirmar Reconciliación" : "Ajuste de Cuenta";
  };

  const getDialogDescription = (): string => {
    if (isPerfectMatch) {
      return "Los montos coinciden perfectamente. ¿Deseas proceder con la reconciliación?";
    }
    
    const typeText = type === "expense_excess" 
      ? `exceso en el gasto (se pagó más de lo facturado)` 
      : `exceso en las facturas (se facturó más de lo pagado)`;
    return `Se requiere un ajuste de ${formatCurrency(Math.abs(amount))} por ${typeText}.`;
  };

  const getAccountDescription = (): string => {
    if (type === "expense_excess") {
      return "El exceso se registrará como anticipo a proveedor";
    } else {
      return "La diferencia se registrará como deuda pendiente por pagar";
    }
  };

  const getNotesLabel = (): string => {
    return isPerfectMatch ? "Notas (opcional)" : "Notas sobre el ajuste";
  };

  const getNotesPlaceholder = (): string => {
    if (isPerfectMatch) {
      return "Agrega cualquier comentario sobre esta reconciliación...";
    }
    
    const suggestion = type === "expense_excess" 
      ? "Ej: Pago adelantado por servicios futuros, error en el cálculo, etc."
      : "Ej: Factura pendiente de pago parcial, diferencia en tipos de cambio, etc.";
    return suggestion;
  };

  const getConfirmButtonText = (): string => {
    return isPerfectMatch ? "Confirmar Reconciliación" : "Confirmar Ajuste";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isPerfectMatch && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-sm text-blue-900">Cuenta de Ajuste Seleccionada</span>
                </div>
                <div className="text-sm text-blue-800">
                  <div className="font-mono">{adjustmentAccount.code} - {adjustmentAccount.name}</div>
                  <div className="text-xs mt-1 text-blue-600">{adjustmentAccount.description}</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Explicación:</strong> {getAccountDescription()}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{getNotesLabel()}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getNotesPlaceholder()}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            {getConfirmButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
