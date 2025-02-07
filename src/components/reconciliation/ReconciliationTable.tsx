
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface ReconciliationTableProps {
  expenses: any[];
  invoices: any[];
}

export function ReconciliationTable({ expenses, invoices }: ReconciliationTableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleReconcile = async (expenseId: string, invoiceId: number) => {
    try {
      const { error } = await supabase
        .from("expense_invoice_relations")
        .insert([{ expense_id: expenseId, invoice_id: invoiceId }]);

      if (error) throw error;

      // Also mark the invoice as processed if needed
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({ processed: true })
        .eq("id", invoiceId);

      if (invoiceError) throw invoiceError;

      toast.success("Gasto conciliado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["unreconciled-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled-invoices"] });
    } catch (error) {
      console.error("Error al conciliar:", error);
      toast.error("Error al conciliar el gasto");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const isExpense = active.id.toString().startsWith('expense-');
    const isInvoice = active.id.toString().startsWith('invoice-');
    const targetIsExpense = over.id.toString().startsWith('expense-');
    const targetIsInvoice = over.id.toString().startsWith('invoice-');

    // Solo permitir drag de expense a invoice o viceversa
    if ((isExpense && targetIsInvoice) || (isInvoice && targetIsExpense)) {
      const expenseId = isExpense 
        ? active.id.toString().replace('expense-', '')
        : over.id.toString().replace('expense-', '');
      const invoiceId = isInvoice
        ? parseInt(active.id.toString().replace('invoice-', ''), 10)
        : parseInt(over.id.toString().replace('invoice-', ''), 10);

      handleReconcile(expenseId, invoiceId);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Gastos sin Conciliar</h3>
          {expenses.map((expense) => (
            <Card
              key={`expense-${expense.id}`}
              id={`expense-${expense.id}`}
              className="cursor-move"
              draggable
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Facturas sin Conciliar</h3>
          {invoices.map((invoice) => (
            <Card
              key={`invoice-${invoice.id}`}
              id={`invoice-${invoice.id}`}
              className="cursor-move"
              draggable
            >
              <CardContent className="p-4">
                <div className="grid gap-1">
                  <div className="font-medium">
                    {invoice.serie 
                      ? `${invoice.serie}-${invoice.invoice_number}`
                      : invoice.invoice_number || invoice.uuid}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.issuer_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${invoice.total_amount?.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
