import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DollarSign, Receipt, Calendar, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesImportDialog } from "@/components/sales/SalesImportDialog";

const Sales = () => {
  console.log("Sales component rendering");
  const [isLoading, setIsLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { data: sales, refetch } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      return data;
    },
  });

  const totalSales = sales?.reduce((acc, sale) => acc + (sale.price || 0), 0) || 0;
  const totalProfit = sales?.reduce((acc, sale) => acc + (sale.Profit || 0), 0) || 0;
  const averageMargin = sales?.reduce((acc, sale) => acc + (sale.profitMargin || 0), 0) / (sales?.length || 1) || 0;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Resumen de Ventas</h1>
        <Button onClick={() => setImportDialogOpen(true)} variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importar Ventas
        </Button>
        <SalesImportDialog
          open={importDialogOpen}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
