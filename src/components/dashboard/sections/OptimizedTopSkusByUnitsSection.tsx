
import React from "react";
import { useOptimizedTopSkusByUnits } from "@/hooks/dashboard/useOptimizedTopSkusByUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/utils/formatters";
import { Package2 } from "lucide-react";
import { DateRange } from "react-day-picker";

interface OptimizedTopSkusByUnitsSectionProps {
  dateRange: DateRange | undefined;
}

export const OptimizedTopSkusByUnitsSection = ({ dateRange }: OptimizedTopSkusByUnitsSectionProps) => {
  const { topSkus, loading } = useOptimizedTopSkusByUnits(dateRange);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="flex items-center">
            <Package2 className="mr-2 h-5 w-5" />
            <span>Top 50 SKUs por Unidades Vendidas (Optimizado)</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : topSkus.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No hay datos disponibles para el período seleccionado
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Comparación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSkus.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <span
                          className={
                            item.change_percentage > 0
                              ? "text-green-600"
                              : item.change_percentage < 0
                              ? "text-red-600"
                              : "text-gray-500"
                          }
                        >
                          {item.change_percentage > 0 ? "+" : ""}
                          {item.change_percentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
