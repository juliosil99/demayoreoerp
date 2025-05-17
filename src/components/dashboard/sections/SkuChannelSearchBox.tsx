
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSkuChannelSales, SkuSalesResult } from "@/hooks/dashboard/useSkuChannelSales";
import { formatCurrency } from "@/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface SkuChannelSearchBoxProps {
  dateRange?: DateRange;
}

export function SkuChannelSearchBox({ dateRange }: SkuChannelSearchBoxProps) {
  const [skuInput, setSkuInput] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const { isLoading, results, fetchSales } = useSkuChannelSales({ dateRange });

  // Fetch sales channels
  const { data: salesChannels, isLoading: channelsLoading } = useQuery({
    queryKey: ["sales-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_channels")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const handleSearch = () => {
    if (skuInput.trim()) {
      fetchSales(skuInput.trim(), selectedChannel === "all" ? undefined : selectedChannel);
    }
  };

  // Calculate totals from results
  const totalQuantity = results.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = results.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Búsqueda de Ventas por SKU</CardTitle>
        <CardDescription>
          Busca la cantidad vendida de un SKU específico por canal en el periodo seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Search controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Ingresa un SKU"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              {channelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedChannel}
                  onValueChange={(value) => setSelectedChannel(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Canal de venta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los canales</SelectItem>
                    {salesChannels?.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !skuInput.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>

          {/* Results section */}
          {isLoading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4 mt-2">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Cantidad total</div>
                  <div className="text-2xl font-bold">{totalQuantity}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Ingresos totales</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                </div>
              </div>

              {/* Results table */}
              <div className="rounded-md border">
                <div className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium">Canal</th>
                        <th className="px-4 py-2 text-right font-medium">Cantidad</th>
                        <th className="px-4 py-2 text-right font-medium">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr 
                          key={`${result.sku}-${result.channel}-${index}`}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-2">{result.channel}</td>
                          <td className="px-4 py-2 text-right">{result.quantity}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(result.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : skuInput.trim() ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron resultados para el SKU "{skuInput}"
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
