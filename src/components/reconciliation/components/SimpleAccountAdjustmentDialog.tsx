
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
import { formatCurrency } from "@/utils/formatters";

// Tipos simples para evitar dependencias circulares
interface SimpleCompany {
  id: string;
  rfc: string;
  nombre: string;
}

interface SimpleChartAccount {
  id: string;
  name: string;
  code: string;
}

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

  // Query simple para empresa del usuario
  const { data: userCompany } = useQuery<SimpleCompany | null>({
    queryKey: ["simple-user-company"],
    queryFn: async (): Promise<SimpleCompany | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;

      // Primero verificar en company_users
      const { data: companyUser } = await supabase
        .from("company_users")
        .select(`
          company_id,
          companies!inner (
            id,
            rfc,
            nombre
          )
        `)
        .eq("user_id", user.id)
        .single();

      if (companyUser?.companies) {
        const company = companyUser.companies as any;
        return {
          id: company.id,
          rfc: company.rfc,
          nombre: company.nombre
        };
      }

      // Si no, verificar si es owner
      const { data: ownedCompany } = await supabase
        .from("companies")
        .select("id, rfc, nombre")
        .eq("user_id", user.id)
        .single();

      if (ownedCompany) {
        return {
          id: ownedCompany.id,
          rfc: ownedCompany.rfc,
          nombre: ownedCompany.nombre
        };
      }

      return null;
    },
  });

  // Query simple para cuentas contables
  const { data: chartAccounts } = useQuery<SimpleChartAccount[]>({
    queryKey: ["simple-chart-accounts", userCompany?.id],
    queryFn: async (): Promise<SimpleChartAccount[]> => {
      if (!userCompany?.id) return [];
      
      const { data } = await supabase
        .from("chart_of_accounts")
        .select("id, name, code")
        .eq("company_id", userCompany.id)
        .order("code");

      return data?.map(account => ({
        id: account.id,
        name: account.name,
        code: account.code
      })) || [];
    },
    enabled: !!userCompany?.id,
  });

  const isPerfectMatch = Math.abs(amount) <= 0.01;

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
