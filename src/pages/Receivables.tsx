
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SalesSearch } from "@/components/sales/components/SalesSearch";

const ROWS_PER_PAGE = 50;

const Receivables = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: unpaidSales, isLoading } = useQuery({
    queryKey: ["unpaid-sales"],
    queryFn: async () => {
      // Query directly from Sales table for unpaid sales
      const { data, error } = await supabase
        .from("Sales")
        .select('*')
        .or('statusPaid.eq.por cobrar,statusPaid.is.null,statusPaid.eq.')
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter sales based on search term
  const filteredSales = unpaidSales?.filter(sale =>
    sale.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((filteredSales?.length || 0) / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedSales = filteredSales?.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const markAsPaid = useMutation({
    mutationFn: async (saleId: number) => {
      // Update the Sales record directly
      const { error } = await supabase
        .from('Sales')
        .update({ 
          statusPaid: 'cobrado',
          datePaid: new Date().toISOString()
        })
        .eq('id', saleId);

      if (error) throw error;
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
          <div className="mb-4">
            <SalesSearch onSearch={setSearchTerm} />
          </div>
          {isLoading ? (
            <div>Cargando...</div>
          ) : paginatedSales && paginatedSales.length > 0 ? (
            <>
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
                  {paginatedSales.map((sale) => (
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

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
