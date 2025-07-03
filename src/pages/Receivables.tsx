
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Bug } from "lucide-react";
import { useOptimizedReceivables } from "@/hooks/receivables/useOptimizedReceivables";
import { ReceivablesFilters } from "@/components/receivables/ReceivablesFilters";
import { ReceivablesTable } from "@/components/receivables/ReceivablesTable";
import { ReceivablesPagination } from "@/components/receivables/ReceivablesPagination";
import { ReceivablesDebugPanel } from "@/components/receivables/ReceivablesDebugPanel";

const Receivables = () => {
  const [showDebug, setShowDebug] = useState(false);
  const queryClient = useQueryClient();

  const {
    sales,
    queryStats,
    filters,
    isLoading,
    error,
    paginationInfo,
    updateFilters,
    clearFilters,
    goToPage,
    nextPage,
    previousPage,
  } = useOptimizedReceivables();

  // Force refresh
  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["unpaid-sales-optimized"] });
    toast.info("Datos actualizados");
    console.log("🔄 [RECEIVABLES] Force refresh triggered");
  };

  // Get unique channels from current data for filter
  const uniqueChannels = Array.from(
    new Set(sales.map(sale => sale.Channel).filter(Boolean))
  );

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
        <ReceivablesDebugPanel
          isLoading={isLoading}
          error={error}
          salesCount={sales.length}
          totalCount={paginationInfo.totalCount}
          queryStats={queryStats}
          filters={filters}
        />
      )}

      {/* Filters */}
      <ReceivablesFilters
        searchTerm={filters.searchTerm}
        startDate={filters.startDate}
        endDate={filters.endDate}
        selectedChannel={filters.selectedChannel}
        uniqueChannels={uniqueChannels}
        onSearchChange={(value) => updateFilters({ searchTerm: value })}
        onStartDateChange={(value) => updateFilters({ startDate: value })}
        onEndDateChange={(value) => updateFilters({ endDate: value })}
        onChannelChange={(value) => updateFilters({ selectedChannel: value })}
        onClearFilters={clearFilters}
      />

      {/* Filter Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Mostrando {sales.length} ventas en esta página</span>
        {queryStats && (
          <span>
            Rango: {queryStats.oldestDate} - {queryStats.newestDate} 
            ({queryStats.totalRecords} total)
          </span>
        )}
      </div>

      {/* Warning if no results and filters are applied */}
      {!isLoading && 
       sales.length === 0 && 
       (filters.startDate || filters.endDate || filters.selectedChannel !== "all" || filters.searchTerm) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontraron ventas con los filtros aplicados. 
            <Button
              variant="link"
              size="sm"
              onClick={clearFilters}
              className="p-0 h-auto ml-1"
            >
              Limpiar filtros
            </Button>
            para ver todas las ventas por cobrar.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Pendientes de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceivablesTable sales={sales} isLoading={isLoading} />
          
          {/* Pagination */}
          {paginationInfo.totalPages > 1 && (
            <div className="mt-6">
              <ReceivablesPagination
                currentPage={filters.currentPage}
                paginationInfo={paginationInfo}
                onPageChange={goToPage}
                onPreviousPage={previousPage}
                onNextPage={nextPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Receivables;
