
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
import { AccountReceivable } from "@/types/receivables";
import { toast } from "sonner";
import { ReceivableForm } from "@/components/receivables/ReceivableForm";
import { PlusIcon } from "lucide-react";

const Receivables = () => {
  const queryClient = useQueryClient();

  const { data: receivables, isLoading } = useQuery({
    queryKey: ["receivables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_receivable")
        .select(`
          *,
          client:contacts!fk_client(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AccountReceivable[];
    },
  });

  const createReceivable = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('accounts_receivable')
        .insert([{
          ...data,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Cuenta por cobrar creada exitosamente");
    },
    onError: (error) => {
      console.error('Error creating receivable:', error);
      toast.error("Error al crear la cuenta por cobrar");
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (receivableId: string) => {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({ status: 'paid' })
        .eq('id', receivableId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Receivable marked as paid and expense created");
    },
    onError: (error) => {
      console.error('Error marking receivable as paid:', error);
      toast.error("Failed to mark receivable as paid");
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

  const handleMarkAsPaid = (receivableId: string) => {
    markAsPaid.mutate(receivableId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Cuenta por Cobrar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Cuenta por Cobrar</DialogTitle>
            </DialogHeader>
            <ReceivableForm
              onSubmit={(data) => {
                createReceivable.mutate(data);
              }}
              isSubmitting={createReceivable.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cuentas por Cobrar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables?.map((receivable) => (
                  <TableRow key={receivable.id}>
                    <TableCell>
                      {receivable.client && (
                        <div>
                          <div className="font-medium">{receivable.client.name}</div>
                          <div className="text-sm text-muted-foreground">{receivable.client.rfc}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {receivable.invoice && (
                        <div>
                          <div>{receivable.invoice.invoice_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(receivable.invoice.invoice_date), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(receivable.amount)}</TableCell>
                    <TableCell>{receivable.description}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(receivable.status)}>
                        {receivable.status === 'pending' ? 'Pendiente' : 'Pagado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {receivable.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(receivable.id)}
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

export default Receivables;
