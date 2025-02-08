
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ReconciliationTableProps {
  expenses: any[];
  invoices: any[];
}

export function ReconciliationTable({ expenses, invoices }: ReconciliationTableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);

  const handleInvoiceSelect = (invoice: any) => {
    const updatedInvoices = [...selectedInvoices, invoice];
    setSelectedInvoices(updatedInvoices);
    
    // Calculate remaining amount
    const totalSelectedAmount = updatedInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const newRemainingAmount = selectedExpense?.amount - totalSelectedAmount;
    setRemainingAmount(newRemainingAmount);

    // If all amount is reconciled, proceed with reconciliation
    if (newRemainingAmount === 0) {
      handleReconcile(updatedInvoices);
    } else if (newRemainingAmount < 0) {
      // Remove the last added invoice as it would exceed the expense amount
      setSelectedInvoices(selectedInvoices);
      toast.error("El monto total de las facturas excede el monto del gasto");
    }
  };

  const handleReconcile = async (invoicesToReconcile: any[]) => {
    try {
      let remainingExpenseAmount = selectedExpense.amount;

      // Create reconciliation records for each invoice
      for (const invoice of invoicesToReconcile) {
        const reconciliationAmount = Math.min(remainingExpenseAmount, invoice.total_amount);
        
        const { error: relationError } = await supabase
          .from("expense_invoice_relations")
          .insert([{
            expense_id: selectedExpense.id,
            invoice_id: invoice.id,
            reconciled_amount: reconciliationAmount
          }]);

        if (relationError) throw relationError;

        // Update invoice paid amount
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: invoice.paid_amount + reconciliationAmount,
            processed: reconciliationAmount === invoice.total_amount
          })
          .eq("id", invoice.id);

        if (invoiceError) throw invoiceError;

        remainingExpenseAmount -= reconciliationAmount;

        // If there's remaining invoice amount, create accounts payable record
        if (invoice.total_amount > reconciliationAmount) {
          const { error: payableError } = await supabase
            .from("accounts_payable_expenses")
            .insert([{
              user_id: user!.id,
              invoice_id: invoice.id,
              amount: invoice.total_amount - reconciliationAmount,
              description: `Monto pendiente por pagar de factura ${invoice.invoice_number || invoice.uuid}`
            }]);

          if (payableError) throw payableError;
        }
      }

      toast.success("Gasto conciliado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
      setShowInvoiceSearch(false);
      setSelectedExpense(null);
      setSelectedInvoices([]);
      setRemainingAmount(0);
    } catch (error) {
      console.error("Error al conciliar:", error);
      toast.error("Error al conciliar el gasto");
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesIssuer = invoice.issuer_name?.toLowerCase().includes(searchLower);
    const matchesAmount = invoice.total_amount?.toString().includes(searchTerm);
    return matchesIssuer || matchesAmount;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gastos sin Conciliar</h3>
        {expenses.map((expense) => (
          <Card
            key={expense.id}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => {
              setSelectedExpense(expense);
              setSelectedInvoices([]);
              setRemainingAmount(expense.amount);
              setShowInvoiceSearch(true);
            }}
          >
            <CardContent className="p-4">
              <div className="grid gap-1">
                <div className="font-medium">
                  {format(new Date(expense.date), "dd/MM/yyyy")}
                </div>
                <div>{expense.description}</div>
                <div className="text-sm text-muted-foreground">
                  ${expense.amount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {expense.bank_accounts?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {expense.contacts?.name || "-"}
                </div>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedExpense(expense);
                    setSelectedInvoices([]);
                    setRemainingAmount(expense.amount);
                    setShowInvoiceSearch(true);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Factura
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CommandDialog open={showInvoiceSearch} onOpenChange={setShowInvoiceSearch}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Seleccionar Facturas</h2>
          <div className="mt-2">
            <Label>Monto del Gasto: ${selectedExpense?.amount.toFixed(2)}</Label>
            {remainingAmount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Monto restante por conciliar: ${remainingAmount.toFixed(2)}
              </p>
            )}
            {selectedInvoices.length > 0 && (
              <div className="mt-2">
                <Label>Facturas seleccionadas:</Label>
                <ul className="mt-1 space-y-1">
                  {selectedInvoices.map((inv) => (
                    <li key={inv.id} className="text-sm">
                      {inv.issuer_name} - ${inv.total_amount.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <CommandInput 
          placeholder="Buscar facturas por proveedor o monto..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No se encontraron facturas.</CommandEmpty>
          <CommandGroup heading="Facturas Disponibles">
            {filteredInvoices
              .filter(invoice => !selectedInvoices.some(selected => selected.id === invoice.id))
              .map((invoice) => (
                <CommandItem
                  key={invoice.id}
                  onSelect={() => handleInvoiceSelect(invoice)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {invoice.serie 
                        ? `${invoice.serie}-${invoice.invoice_number}`
                        : invoice.invoice_number || invoice.uuid}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {invoice.issuer_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ${invoice.total_amount?.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
