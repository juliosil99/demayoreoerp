
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

interface ReconciliationTableProps {
  expenses: any[];
  invoices: any[];
}

export function ReconciliationTable({ expenses, invoices }: ReconciliationTableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedInvoices, setSelectedInvoices] = useState<{ [key: string]: string }>({});

  const handleReconcile = async (expenseId: string, invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update({ invoice_id: parseInt(invoiceId, 10) })
        .eq("id", expenseId)
        .eq("user_id", user!.id);

      if (error) throw error;

      // Also mark the invoice as processed
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({ processed: true })
        .eq("id", parseInt(invoiceId, 10));

      if (invoiceError) throw invoiceError;

      toast.success("Gasto conciliado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
    } catch (error) {
      console.error("Error al conciliar:", error);
      toast.error("Error al conciliar el gasto");
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Factura</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>${expense.amount.toFixed(2)}</TableCell>
              <TableCell>{expense.bank_accounts?.name}</TableCell>
              <TableCell>{expense.contacts?.name || "-"}</TableCell>
              <TableCell>
                <Select
                  value={selectedInvoices[expense.id] || ""}
                  onValueChange={(value) => {
                    setSelectedInvoices((prev) => ({
                      ...prev,
                      [expense.id]: value,
                    }));
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar factura" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id.toString()}>
                        {invoice.serie 
                          ? `${invoice.serie}-${invoice.invoice_number}`
                          : invoice.invoice_number || invoice.uuid}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!selectedInvoices[expense.id]}
                  onClick={() => {
                    if (selectedInvoices[expense.id]) {
                      handleReconcile(expense.id, selectedInvoices[expense.id]);
                    }
                  }}
                >
                  Conciliar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
