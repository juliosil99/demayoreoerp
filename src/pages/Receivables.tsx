
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

const Receivables = () => {
  const queryClient = useQueryClient();

  const { data: unpaidSales, isLoading } = useQuery({
    queryKey: ["unpaid-sales"],
    queryFn: async () => {
      // Updated query to include both 'por cobrar' and null/empty statusPaid values
      const { data, error } = await supabase
        .from("Sales")
        .select(`
          *,
          accounts_receivable!inner(id, status)
        `)
        .or('statusPaid.eq.por cobrar,statusPaid.is.null,statusPaid.eq.')
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async ({ saleId, receivableId }: { saleId: number, receivableId: string }) => {
      // Update the Sales record
      const { error: saleError } = await supabase
        .from('Sales')
        .update({ 
          statusPaid: 'cobrado',
          datePaid: new Date().toISOString()
        })
        .eq('id', saleId);

      if (saleError) throw saleError;

      // Update the accounts_receivable record
      const { error: receivableError } = await supabase
        .from('accounts_receivable')
        .update({ status: 'paid' })
        .eq('id', receivableId);

      if (receivableError) throw receivableError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unpaid-sales"] });
      toast.success("Venta marcada como pagada");
    },
    onError: (error) => {
      console.error('Error marking sale as paid:', error);
      toast.error("Error al marcar la venta como pagada");
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Pendientes de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Cargando...</div>
          ) : unpaidSales && unpaidSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>No. Orden</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidSales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date ? format(new Date(sale.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell>{sale.orderNumber}</TableCell>
                    <TableCell>{sale.productName}</TableCell>
                    <TableCell>{sale.Channel || 'N/A'}</TableCell>
                    <TableCell className="text-right">{sale.price ? formatCurrency(sale.price) : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Por Cobrar</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (sale.accounts_receivable?.[0]?.id) {
                            markAsPaid.mutate({
                              saleId: sale.id,
                              receivableId: sale.accounts_receivable[0].id
                            });
                          }
                        }}
                        disabled={markAsPaid.isPending}
                      >
                        Marcar como Pagado
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay ventas pendientes de pago en este momento.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Receivables;
