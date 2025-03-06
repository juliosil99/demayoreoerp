
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "./ExpenseForm";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types/base";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
    }
  }[];
};

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (expense: Expense) => {
    setDeleteError(null);
    try {
      console.log("Intentando eliminar gasto con ID:", expense.id);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        console.error("Error detallado al eliminar gasto:", error);
        
        // Determinar el tipo de error para mostrar un mensaje más específico
        if (error.code === '23503' && error.details?.includes('accounting_adjustments')) {
          setDeleteError("No se puede eliminar este gasto porque está vinculado a ajustes contables. Debes eliminar primero los ajustes asociados.");
          toast.error("Este gasto está vinculado a ajustes contables y no puede ser eliminado directamente");
        } else {
          setDeleteError(`Error al eliminar: ${error.message}`);
          toast.error(`Error al eliminar el gasto: ${error.message}`);
        }
        throw error;
      }

      console.log("Gasto eliminado exitosamente:", expense.id);
      toast.success('Gasto eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    } catch (error) {
      console.error('Error completo al eliminar gasto:', error);
    }
  };

  const handleOpenDialog = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedExpense(null), 300);
  }, []);

  if (isLoading) {
    return <div>Cargando gastos...</div>;
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>
            {deleteError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Cuenta Bancaria</TableHead>
              <TableHead>Cuenta de Gasto</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {format(new Date(expense.date + 'T00:00:00'), 'MMM dd, yyyy', { locale: es })}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>${expense.amount.toFixed(2)}</TableCell>
                <TableCell>{expense.bank_accounts.name}</TableCell>
                <TableCell>
                  {expense.chart_of_accounts.code} - {expense.chart_of_accounts.name}
                </TableCell>
                <TableCell>{expense.contacts?.name || '-'}</TableCell>
                <TableCell className="capitalize">
                  {expense.payment_method === 'cash' ? 'Efectivo' :
                   expense.payment_method === 'transfer' ? 'Transferencia' :
                   expense.payment_method === 'check' ? 'Cheque' :
                   expense.payment_method === 'credit_card' ? 'Tarjeta de Crédito' :
                   expense.payment_method.replace('_', ' ')}
                </TableCell>
                <TableCell>{expense.reference_number || '-'}</TableCell>
                <TableCell>
                  {expense.expense_invoice_relations?.length ? 
                    expense.expense_invoice_relations.map(relation => 
                      relation.invoice.invoice_number || relation.invoice.uuid
                    ).join(', ') : 
                    'Sin conciliar'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen && selectedExpense?.id === expense.id} onOpenChange={(open) => {
                      if (!open) handleCloseDialog();
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleOpenDialog(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Editar Gasto</DialogTitle>
                        </DialogHeader>
                        {selectedExpense && (
                          <ExpenseForm 
                            initialData={selectedExpense} 
                            onSuccess={handleCloseDialog}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el gasto.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(expense)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
