import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DollarSign, Receipt, Calendar, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesImportDialog } from "@/components/sales/SalesImportDialog";
import { downloadSalesExcelTemplate } from "@/components/sales/utils/salesTemplateUtils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 50;

const Sales = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { data: sales, refetch } = useQuery({
    queryKey: ["sales", currentPage],
    queryFn: async () => {
      const { count } = await supabase
        .from("Sales")
        .select("*", { count: "exact", head: true });
      
      setTotalCount(count || 0);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("Sales")
        .select("*")
        .order("date", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      return data;
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const totalSales = sales?.reduce((acc, sale) => acc + (sale.price || 0), 0) || 0;
  const totalProfit = sales?.reduce((acc, sale) => acc + (sale.Profit || 0), 0) || 0;
  const averageMargin = sales?.reduce((acc, sale) => acc + (sale.profitMargin || 0), 0) / (sales?.length || 1) || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Resumen de Ventas</h1>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={downloadSalesExcelTemplate}
            className="border border-dashed"
          >
            Descargar plantilla
          </Button>
          <Button onClick={() => setImportDialogOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar Ventas
          </Button>
        </div>
        <SalesImportDialog
          isOpen={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImportSuccess={() => refetch()}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMargin.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>No. Orden</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>ID Cliente</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.date || "").toLocaleDateString()}</TableCell>
                    <TableCell>{sale.orderNumber}</TableCell>
                    <TableCell>{sale.productName}</TableCell>
                    <TableCell>{sale.idClient}</TableCell>
                    <TableCell className="text-right">${sale.price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-right">${sale.Profit?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{sale.statusPaid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
