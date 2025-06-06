
import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SalesImportDialog } from "@/components/sales/SalesImportDialog";
import { SalesHeader } from "@/components/sales/components/SalesHeader";
import { SalesTable } from "@/components/sales/components/SalesTable";
import { useOptimizedSalesQuery } from "@/hooks/sales/useOptimizedSalesQuery";

const ITEMS_PER_PAGE = 50;

const Sales = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNegativeProfit, setShowNegativeProfit] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { sales, totalCount, isLoading, error } = useOptimizedSalesQuery({
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    searchTerm,
    showNegativeProfit
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleNegativeProfitFilter = useCallback((enabled: boolean) => {
    setShowNegativeProfit(enabled);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleImportSuccess = useCallback(() => {
    // This will invalidate and refetch the query
    window.location.reload();
  }, []);

  if (error) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="text-center py-8 text-destructive">
          Error al cargar las ventas: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <SalesHeader 
        onImportClick={() => setImportDialogOpen(true)}
        onSearch={handleSearch}
        onNegativeProfitFilter={handleNegativeProfitFilter}
        showingNegativeProfit={showNegativeProfit}
      />
      
      <SalesImportDialog
        isOpen={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />

      <Card>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando ventas...
            </div>
          ) : (
            <SalesTable
              sales={sales || []}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
