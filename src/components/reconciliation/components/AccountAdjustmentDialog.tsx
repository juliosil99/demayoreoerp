
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

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
  onConfirm
}: AccountAdjustmentDialogProps) {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [notes, setNotes] = useState("");

  const { data: chartAccounts } = useQuery({
    queryKey: ["chart-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .order("code");
      
      if (error) throw error;
      return data;
    }
  });

  const handleConfirm = () => {
    if (!selectedAccount) {
      toast.error("Por favor selecciona una cuenta contable");
      return;
    }
    onConfirm(selectedAccount, notes);
    setSelectedAccount("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuste Contable</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Monto del Ajuste</Label>
            <Input value={amount.toFixed(2)} disabled />
          </div>
          <div>
            <Label>Tipo de Ajuste</Label>
            <Input 
              value={type === "expense_excess" ? "Excedente de Gasto" : "Excedente de Factura"} 
              disabled 
            />
          </div>
          <div>
            <Label>Cuenta Contable</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
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
          <div>
            <Label>Notas</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre el ajuste"
            />
          </div>
          <Button onClick={handleConfirm} className="w-full">
            Confirmar Ajuste
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
