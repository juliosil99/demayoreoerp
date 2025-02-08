
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const handleReconcile = async (expenseId: string, invoiceId: number) => {
    try {
      const { error } = await supabase
        .from("expense_invoice_relations")
        .insert([{ expense_id: expenseId, invoice_id: invoiceId }]);

      if (error) throw error;

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({ processed: true })
        .eq("id", invoiceId);

      if (invoiceError) throw invoiceError;

      toast.success("Gasto conciliado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
      setShowInvoiceSearch(false);
      setSelectedExpense(null);
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
        <CommandInput 
          placeholder="Buscar facturas por proveedor o monto..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No se encontraron facturas.</CommandEmpty>
          <CommandGroup heading="Facturas Disponibles">
            {filteredInvoices.map((invoice) => (
              <CommandItem
                key={invoice.id}
                onSelect={() => {
                  if (selectedExpense) {
                    handleReconcile(selectedExpense.id, invoice.id);
                  }
                }}
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
