
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCompany } from "@/hooks/useUserCompany";
import { formatCurrency } from "@/utils/formatters";

interface AccountAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  type: "expense_excess" | "invoice_excess";
  onConfirm: (chartAccountId: string, notes: string) => void;
}

export function AccountAdjustmentDialog({
  open,
  onOpenChange,
  amount,
  type,
  onConfirm,
}: AccountAdjustmentDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const { data: userCompany } = useUserCompany();

  const { data: chartAccounts } = useQuery({
    queryKey: ["chart-accounts", userCompany?.id],
    queryFn: async () => {
      if (!userCompany?.id) return [];
      
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("id, name, code")
        .eq("company_id", userCompany.id)
        .order("code");

      if (error) throw error;
      return data || [];
    },
    enabled: !!userCompany?.id,
  });

  // Simple boolean calculation
  const perfectMatch = Math.abs(amount) <= 0.01;

  const handleConfirm = () => {
    if (!perfectMatch && !selectedAccountId) {
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
            {perfectMatch ? "Confirmar Reconciliación" : "Ajuste de Cuenta"}
          </DialogTitle>
          <DialogDescription>
            {perfectMatch 
              ? "Los montos coinciden perfectamente. ¿Deseas proceder con la reconciliación?"
              : `Se requiere un ajuste de ${formatCurrency(amount)} por ${
                  type === "expense_excess" ? "exceso en el gasto" : "exceso en las facturas"
                }.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!perfectMatch && (
            <div className="space-y-2">
              <Label htmlFor="account">Cuenta Contable para el Ajuste</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {chartAccounts?.map((account) => (
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
              {perfectMatch ? "Notas (opcional)" : "Notas sobre el ajuste"}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={perfectMatch 
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
            disabled={!perfectMatch && !selectedAccountId}
          >
            {perfectMatch ? "Confirmar Reconciliación" : "Confirmar Ajuste"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
