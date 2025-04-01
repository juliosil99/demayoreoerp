
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { AccountPayable } from "@/types/payables";
import { toast } from "sonner";
import { PayableForm } from "@/components/payables/PayableForm";
import { PlusIcon, FileText } from "lucide-react";
import { useState } from "react";

const Payables = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: payables, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_payable")
        .select(`
          *,
          client:contacts!client_id(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AccountPayable[];
    },
  });

  const createPayable = useMutation({
    mutationFn: async (data: any) => {
      // Important change: Remove the due_date calculation based on payment_term
      // and use the manually selected due_date directly
      
      const { error } = await supabase
        .from('accounts_payable')
        .insert([{
          ...data,
          // Format the due_date to ISO format (YYYY-MM-DD)
          due_date: format(data.due_date, 'yyyy-MM-dd'),
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Cuenta por pagar creada exitosamente");
      // Close the dialog after successful creation
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating payable:', error);
      toast.error("Error al crear la cuenta por pagar");
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (payableId: string) => {
      // First check if the payable has an associated invoice
      const { data: payable, error: fetchError } = await supabase
        .from('accounts_payable')
        .select('invoice_id')
        .eq('id', payableId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Mark the payable as paid which will trigger the database function to create an expense
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid' })
        .eq('id', payableId);

      if (error) throw error;
      
      // If there's an invoice associated, we'll display a different message
      return !!payable.invoice_id;
    },
    onSuccess: (hasInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error) => {
      console.error('Error marking payable as paid:', error);
      toast.error("Error al marcar como pagada");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleMarkAsPaid = (payableId: string) => {
    markAsPaid.mutate(payableId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuentas por Pagar</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Cuenta por Pagar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Cuenta por Pagar</DialogTitle>
            </DialogHeader>
            <PayableForm
              onSubmit={(data) => {
                createPayable.mutate(data);
              }}
              isSubmitting={createPayable.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cuentas por Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha de Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables?.map((payable) => (
                  <TableRow key={payable.id}>
                    <TableCell>
                      {payable.client && (
                        <div>
                          <div className="font-medium">{payable.client.name}</div>
                          <div className="text-sm text-muted-foreground">{payable.client.rfc}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {payable.invoice ? (
                        <div className="flex items-center space-x-2">
                          <div>
                            <div>{payable.invoice.invoice_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(payable.invoice.invoice_date), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          {payable.invoice.id && (
                            <a 
                              href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/invoices/${payable.invoice.uuid}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FileText size={16} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin factura</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(payable.amount)}</TableCell>
                    <TableCell>{format(new Date(payable.due_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payable.status)}>
                        {payable.status === 'pending' ? 'Pendiente' : 'Pagado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payable.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(payable.id)}
                          disabled={markAsPaid.isPending}
                        >
                          Marcar como Pagado
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payables;
