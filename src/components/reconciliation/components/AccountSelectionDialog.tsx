
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
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type AdjustmentType = "expense_excess" | "invoice_excess";

interface ChartAccount {
  id: string;
  name: string;
  code: string;
  account_type: string;
}

interface AccountSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  type: AdjustmentType;
  chartAccounts: ChartAccount[];
  onConfirm: (accountId: string, notes: string) => void;
}

export function AccountSelectionDialog({
  open,
  onOpenChange,
  amount,
  type,
  chartAccounts,
  onConfirm,
}: AccountSelectionDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter and group accounts
  const filteredAccounts = useMemo(() => {
    if (!chartAccounts) return [];
    
    const filtered = chartAccounts.filter(account =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by account type
    const grouped = filtered.reduce((acc, account) => {
      const type = account.account_type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {} as Record<string, ChartAccount[]>);

    return grouped;
  }, [chartAccounts, searchTerm]);

  const getAccountTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      asset: "Activos",
      liability: "Pasivos", 
      equity: "Capital",
      income: "Ingresos",
      expense: "Gastos",
      other: "Otras"
    };
    return labels[type] || type;
  };

  const handleConfirm = () => {
    if (!selectedAccountId) {
      return;
    }
    
    onConfirm(selectedAccountId, notes);
    setSelectedAccountId("");
    setNotes("");
    setSearchTerm("");
  };

  const getDialogTitle = (): string => {
    return "Seleccionar Cuenta Contable para Ajuste";
  };

  const getDialogDescription = (): string => {
    const typeText = type === "expense_excess" 
      ? `exceso en el gasto (se pagó más de lo facturado)` 
      : `exceso en las facturas (se facturó más de lo pagado)`;
    return `Se requiere un ajuste de ${formatCurrency(Math.abs(amount))} por ${typeText}. Selecciona la cuenta contable donde se registrará este ajuste.`;
  };

  const getNotesPlaceholder = (): string => {
    const suggestion = type === "expense_excess" 
      ? "Ej: Pago adelantado por servicios futuros, error en el cálculo, anticipo a proveedor, etc."
      : "Ej: Factura pendiente de pago parcial, diferencia en tipos de cambio, deuda por pagar, etc.";
    return suggestion;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="account-search">Buscar cuenta contable</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="account-search"
                placeholder="Buscar por código o nombre de cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Accounts Selection */}
          <div className="space-y-2">
            <Label>Seleccionar cuenta contable *</Label>
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-3 space-y-4">
                {Object.entries(filteredAccounts).map(([accountType, accounts]) => (
                  <div key={accountType} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {getAccountTypeLabel(accountType)}
                    </h4>
                    <div className="space-y-1">
                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className={`p-2 rounded-md border cursor-pointer transition-colors ${
                            selectedAccountId === account.id
                              ? "bg-blue-50 border-blue-300"
                              : "hover:bg-gray-50 border-gray-200"
                          }`}
                          onClick={() => setSelectedAccountId(account.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">
                                {account.code} - {account.name}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                checked={selectedAccountId === account.id}
                                onChange={() => setSelectedAccountId(account.id)}
                                className="ml-2"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(filteredAccounts).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No se encontraron cuentas contables.</p>
                    <p className="text-sm mt-1">Intenta con un término de búsqueda diferente.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas sobre el ajuste *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getNotesPlaceholder()}
              rows={3}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedAccountId || !notes.trim()}
          >
            Confirmar Ajuste
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
