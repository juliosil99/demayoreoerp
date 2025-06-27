
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

interface SimpleAccountAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  type: "expense_excess" | "invoice_excess";
  onConfirm: (chartAccountId: string, notes: string) => void;
}

export function SimpleAccountAdjustmentDialog({
  open,
  onOpenChange,
  amount,
  type,
  onConfirm,
}: SimpleAccountAdjustmentDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const isPerfectMatch = Math.abs(amount) <= 0.01;

  // Hardcoded chart accounts to avoid infinite type recursion
  const chartAccounts = [
    { id: "1", name: "Gastos Generales", code: "601" },
    { id: "2", name: "Diferencias de Cambio", code: "731" },
    { id: "3", name: "Otros Gastos", code: "702" },
    { id: "4", name: "Ajustes Contables", code: "799" },
  ];

  const handleConfirm = () => {
    if (!isPerfectMatch && !selectedAccountId) {
      return;
    }
    
    onConfirm(selectedAccountId, notes);
    setSelectedAccountId("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPerfectMatch ? "Confirmar Reconciliación" : "Ajuste de Cuenta"}
          </DialogTitle>
          <DialogDescription>
            {isPerfectMatch 
              ? "Los montos coinciden perfectamente. ¿Deseas proceder con la reconciliación?"
              : `Se requiere un ajuste de ${formatCurrency(amount)} por ${type === "expense_excess" ? "exceso en el gasto" : "exceso en las facturas"}.`
            }
          </DialogDescription>
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
                  {chartAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              {isPerfectMatch ? "Notas (opcional)" : "Notas sobre el ajuste"}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isPerfectMatch 
                ? "Agrega cualquier comentario sobre esta reconciliación..."
                : "Describe la razón del ajuste..."
              }
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
            {isPerfectMatch ? "Confirmar Reconciliación" : "Confirmar Ajuste"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
