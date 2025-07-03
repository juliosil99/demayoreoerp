
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROWS_PER_PAGE = 50;

const Receivables = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const queryClient = useQueryClient();

  const { data: unpaidSales, isLoading } = useQuery({
    queryKey: ["unpaid-sales", startDate, endDate, selectedChannel],
    queryFn: async () => {
      // Query directly from Sales table for unpaid sales
      let query = supabase
        .from("Sales")
        .select('*')
        .or('statusPaid.eq.por cobrar,statusPaid.is.null,statusPaid.eq.');

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      // Apply channel filter if selected
      if (selectedChannel !== "all") {
        query = query.eq('Channel', selectedChannel);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Enhanced filtering - search across multiple fields
  const filteredSales = unpaidSales?.filter(sale => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.orderNumber?.toLowerCase().includes(searchLower) ||
      sale.productName?.toLowerCase().includes(searchLower) ||
      sale.Channel?.toLowerCase().includes(searchLower) ||
      sale.sku?.toLowerCase().includes(searchLower) ||
      sale.date?.includes(searchTerm)
    );
  });

  // Get unique channels for filter dropdown
  const uniqueChannels = Array.from(new Set(unpaidSales?.map(sale => sale.Channel).filter(Boolean) || []));

  const totalPages = Math.ceil((filteredSales?.length || 0) / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedSales = filteredSales?.slice(startIndex, startIndex + ROWS_PER_PAGE);

  // Reset pagination when filters change
  const handleFiltersChange = () => {
    setCurrentPage(1);
  };

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
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <SalesSearch 
                onSearch={(term) => {
                  setSearchTerm(term);
                  handleFiltersChange();
                }} 
                placeholder="Buscar por orden, producto, canal, SKU..."
              />
            </div>
            <div>
              <Label htmlFor="startDate">Fecha Desde</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleFiltersChange();
                }}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha Hasta</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  handleFiltersChange();
                }}
              />
            </div>
            <div>
              <Label htmlFor="channel">Canal</Label>
              <Select value={selectedChannel} onValueChange={(value) => {
                setSelectedChannel(value);
                handleFiltersChange();
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los canales</SelectItem>
                  {uniqueChannels.map(channel => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredSales?.length || 0} ventas pendientes
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Pendientes de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Cargando...</div>
          ) : paginatedSales && paginatedSales.length > 0 ? (
            <>
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
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.date ? format(new Date(sale.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
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
