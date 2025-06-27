
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

// Simple auxiliary types to break circular dependencies
type SimpleChartAccount = {
  readonly id: string;
  readonly name: string;
  readonly code: string;
} as const;

type AdjustmentType = "expense_excess" | "invoice_excess";

interface FixedAccountAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  type: AdjustmentType;
  onConfirm: (chartAccountId: string, notes: string) => void;
}

// Hardcoded chart accounts with explicit typing to avoid Supabase complexity
const CHART_ACCOUNTS = [
  { id: "adj-001", name: "Gastos Generales", code: "601" },
  { id: "adj-002", name: "Diferencias de Cambio", code: "731" },
  { id: "adj-003", name: "Otros Gastos", code: "702" },
  { id: "adj-004", name: "Ajustes Contables", code: "799" },
  { id: "adj-005", name: "Gastos de Operación", code: "605" },
] as const satisfies readonly SimpleChartAccount[];

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

  const handleConfirm = () => {
    if (!isPerfectMatch && !selectedAccountId) {
      return;
    }
    
    onConfirm(selectedAccountId, notes);
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
    
    const typeText = type === "expense_excess" ? "exceso en el gasto" : "exceso en las facturas";
    return `Se requiere un ajuste de ${formatCurrency(amount)} por ${typeText}.`;
  };

  const getNotesLabel = (): string => {
    return isPerfectMatch ? "Notas (opcional)" : "Notas sobre el ajuste";
  };

  const getNotesPlaceholder = (): string => {
    return isPerfectMatch 
      ? "Agrega cualquier comentario sobre esta reconciliación..."
      : "Describe la razón del ajuste...";
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
            <div className="space-y-2">
              <Label htmlFor="account">Cuenta Contable para el Ajuste</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {CHART_ACCOUNTS.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <Button 
            onClick={handleConfirm} 
            disabled={!isPerfectMatch && !selectedAccountId}
          >
            {getConfirmButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
