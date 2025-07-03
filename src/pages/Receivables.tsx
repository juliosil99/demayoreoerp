
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SalesSearch } from "@/components/sales/components/SalesSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, RefreshCw, Bug } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ROWS_PER_PAGE = 50;

const Receivables = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [showDebug, setShowDebug] = useState(false);
  const [queryStats, setQueryStats] = useState<{
    totalRecords: number;
    oldestDate: string | null;
    newestDate: string | null;
    uniqueChannels: number;
    queryTime: number;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: unpaidSales, isLoading, error } = useQuery({
    queryKey: ["unpaid-sales", startDate, endDate, selectedChannel, currentPage],
    queryFn: async () => {
      const startTime = performance.now();
      console.log("🔍 [RECEIVABLES] Starting query with filters:", {
        startDate,
        endDate,
        selectedChannel,
        currentPage,
        timestamp: new Date().toISOString()
      });

      try {
        // First get total count
        let countQuery = supabase
          .from("Sales")
          .select('*', { count: 'exact', head: true });

        // Apply unpaid status filter - only NULL values
        countQuery = countQuery.is('statusPaid', null);

        // Apply date filters if provided
        if (startDate) {
          countQuery = countQuery.gte('date', startDate);
        }
        if (endDate) {
          countQuery = countQuery.lte('date', endDate);
        }

        // Apply channel filter if selected
        if (selectedChannel !== "all") {
          countQuery = countQuery.eq('Channel', selectedChannel);
        }

        const { count: totalCount, error: countError } = await countQuery;

        if (countError) {
          console.error("❌ [RECEIVABLES] Count query error:", countError);
          throw countError;
        }

        // Now get the actual data with pagination
        let dataQuery = supabase
          .from("Sales")
          .select('*');

        dataQuery = dataQuery.is('statusPaid', null);

        // Apply same filters
        if (startDate) {
          console.log("📅 [RECEIVABLES] Applying start date filter:", startDate);
          dataQuery = dataQuery.gte('date', startDate);
        }
        if (endDate) {
          console.log("📅 [RECEIVABLES] Applying end date filter:", endDate);
          dataQuery = dataQuery.lte('date', endDate);
        }

        if (selectedChannel !== "all") {
          console.log("📡 [RECEIVABLES] Applying channel filter:", selectedChannel);
          dataQuery = dataQuery.eq('Channel', selectedChannel);
        }

        // Apply pagination using range
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE - 1;

        const { data, error } = await dataQuery
          .order('date', { ascending: true }) // Show oldest first to see historical data
          .range(startIndex, endIndex);

        if (error) {
          console.error("❌ [RECEIVABLES] Query error:", error);
          throw error;
        }

        const endTime = performance.now();
        const queryTime = endTime - startTime;

        console.log("✅ [RECEIVABLES] Query completed:", {
          recordsFound: data?.length || 0,
          queryTime: `${queryTime.toFixed(2)}ms`,
          hasData: !!data,
          firstRecord: data?.[0]?.date,
          lastRecord: data?.[data.length - 1]?.date
        });


        // Update stats with the total count from database
        if (data && data.length > 0) {
          const dates = data.map(sale => sale.date).filter(Boolean).sort();
          const channels = new Set(data.map(sale => sale.Channel).filter(Boolean));
          
          setQueryStats({
            totalRecords: totalCount || 0, // Use the actual total count from database
            oldestDate: dates[0] || null, // Since we're sorting ascending, first is oldest
            newestDate: dates[dates.length - 1] || null,
            uniqueChannels: channels.size,
            queryTime: Math.round(queryTime)
          });
        } else if (totalCount !== null) {
          // Even if no data on this page, show the total count
          setQueryStats({
            totalRecords: totalCount,
            oldestDate: null,
            newestDate: null,
            uniqueChannels: 0,
            queryTime: Math.round(queryTime)
          });
        }

        return { data: data || [], totalCount: totalCount || 0 };
      } catch (err) {
        console.error("💥 [RECEIVABLES] Fatal query error:", err);
        throw err;
      }
    },
  });

  // Enhanced filtering - search across multiple fields (now applied to paginated data)
  const filteredSales = unpaidSales?.data?.filter(sale => {
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
  const uniqueChannels = Array.from(new Set(unpaidSales?.data?.map(sale => sale.Channel).filter(Boolean) || []));

  // Calculate total pages based on database count, not filtered results
  const totalPages = Math.ceil((unpaidSales?.totalCount || 0) / ROWS_PER_PAGE);
  
  // Since we're doing server-side pagination, we don't slice again
  const paginatedSales = filteredSales;

  // Reset pagination when filters change
  const handleFiltersChange = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedChannel("all");
    setCurrentPage(1);
    console.log("🧹 [RECEIVABLES] All filters cleared");
  };

  // Force refresh
  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["unpaid-sales"] });
    toast.info("Datos actualizados");
    console.log("🔄 [RECEIVABLES] Force refresh triggered");
  };

  const markAsPaid = useMutation({
    mutationFn: async (saleId: number) => {
      // Update the Sales record directly
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
      queryClient.invalidateQueries({ queryKey: ["unpaid-sales"] });
      toast.success("Venta marcada como pagada");
    },
    onError: (error) => {
      console.error('Error marking sale as paid:', error);
      toast.error("Error al marcar la venta como pagada");
    },
  });

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={forceRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Panel de Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Estado de Consulta:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Loading: {isLoading ? "Sí" : "No"}</li>
                  <li>• Error: {error ? "Sí" : "No"}</li>
                  <li>• Datos disponibles: {unpaidSales ? "Sí" : "No"}</li>
                  <li>• Registros encontrados: {unpaidSales?.data?.length || 0}</li>
                  <li>• Total en base de datos: {unpaidSales?.totalCount || 0}</li>
                </ul>
              </div>
              <div>
                <strong>Filtros Activos:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Fecha desde: {startDate || "Sin filtro"}</li>
                  <li>• Fecha hasta: {endDate || "Sin filtro"}</li>
                  <li>• Canal: {selectedChannel === "all" ? "Todos" : selectedChannel}</li>
                  <li>• Búsqueda: {searchTerm || "Sin filtro"}</li>
                </ul>
              </div>
              {queryStats && (
                <div className="md:col-span-2">
                  <strong>Estadísticas de Datos:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Fecha más antigua: {queryStats.oldestDate}</li>
                    <li>• Fecha más reciente: {queryStats.newestDate}</li>
                    <li>• Canales únicos: {queryStats.uniqueChannels}</li>
                    <li>• Tiempo de consulta: {queryStats.queryTime}ms</li>
                  </ul>
                </div>
              )}
            </div>
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Error: {error.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpiar Filtros
            </Button>
          </div>
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
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Mostrando {filteredSales?.length || 0} ventas pendientes</span>
            {queryStats && (
              <span>
                Rango: {queryStats.oldestDate} - {queryStats.newestDate} 
                ({queryStats.totalRecords} total)
              </span>
            )}
          </div>

          {/* Warning if no results and filters are applied */}
          {!isLoading && filteredSales?.length === 0 && (startDate || endDate || selectedChannel !== "all" || searchTerm) && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron ventas con los filtros aplicados. 
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearAllFilters}
                  className="p-0 h-auto ml-1"
                >
                  Limpiar filtros
                </Button>
                para ver todas las ventas por cobrar.
              </AlertDescription>
            </Alert>
          )}
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
