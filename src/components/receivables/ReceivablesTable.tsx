import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";

interface Sale {
  id: number;
  date: string;
  orderNumber: string;
  sku: string;
  productName: string;
  Channel: string;
  price: number;
}

interface ReceivablesTableProps {
  sales: Sale[];
  isLoading: boolean;
}

// Helper function to format dates correctly - treats YYYY-MM-DD as local dates
const formatSaleDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  // Si es solo fecha (YYYY-MM-DD), tratar como local para evitar cambios de zona horaria
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Si tiene hora, usar formatInTimeZone
  return formatInTimeZone(new Date(dateString), 'America/Mexico_City', 'dd/MM/yyyy');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export function ReceivablesTable({ sales, isLoading }: ReceivablesTableProps) {
  const queryClient = useQueryClient();

  const markAsPaid = useMutation({
    mutationFn: async (saleId: number) => {
      const { error } = await supabase
        .from('Sales')
        .update({ 
          statusPaid: 'cobrado',
          datePaid: formatInTimeZone(new Date(), 'America/Mexico_City', 'yyyy-MM-dd')
        })
        .eq('id', saleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unpaid-sales-optimized"] });
      toast.success("Venta marcada como pagada");
    },
    onError: (error) => {
      console.error('Error marking sale as paid:', error);
      toast.error("Error al marcar la venta como pagada");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay ventas pendientes de pago en este momento.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>No. Orden</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>{formatSaleDate(sale.date)}</TableCell>
            <TableCell>{sale.orderNumber}</TableCell>
            <TableCell className="font-mono text-xs">{sale.sku || 'N/A'}</TableCell>
            <TableCell>{sale.productName}</TableCell>
            <TableCell>{sale.Channel || 'N/A'}</TableCell>
            <TableCell className="text-right">{sale.price ? formatCurrency(sale.price) : 'N/A'}</TableCell>
            <TableCell>
              <Badge variant="secondary">Por Cobrar</Badge>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={() => markAsPaid.mutate(sale.id)}
                disabled={markAsPaid.isPending}
              >
                Marcar como Pagado
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}