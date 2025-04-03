
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingDown, TrendingUp } from "lucide-react";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";

interface ForecastItemsCardProps {
  selectedWeek?: ForecastWeek;
  items: ForecastItem[];
  onAddItem?: () => void;
  onEditItem?: (item: ForecastItem) => void;
}

export function ForecastItemsCard({ 
  selectedWeek, 
  items,
  onAddItem,
  onEditItem
}: ForecastItemsCardProps) {
  // Filter items for the selected week
  const weekItems = selectedWeek 
    ? items.filter(item => item.week_id === selectedWeek.id)
    : [];
  
  // Group items by type (inflow/outflow)
  const inflowItems = weekItems.filter(item => item.type === 'inflow');
  const outflowItems = weekItems.filter(item => item.type === 'outflow');
  
  // Source label mapping
  const sourceLabels: Record<string, string> = {
    'historical': 'Histórico',
    'ai_predicted': 'Predicción IA',
    'manual': 'Manual',
    'recurring': 'Recurrente'
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {selectedWeek 
            ? `Detalle de Semana ${selectedWeek.week_number}` 
            : 'Seleccione una semana para ver detalles'
          }
        </CardTitle>
        {selectedWeek && (
          <Button variant="outline" size="sm" onClick={onAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Elemento
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {selectedWeek ? (
          <div className="space-y-4">
            {inflowItems.length > 0 && (
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-green-500">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Entradas
                </h3>
                <Table>
                  <TableHeader className="bg-gray-900 text-white">
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inflowItems.map(item => (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => onEditItem?.(item)}
                      >
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.description || '-'}</TableCell>
                        <TableCell>{sourceLabels[item.source] || item.source}</TableCell>
                        <TableCell className="text-right">
                          ${item.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total row */}
                    <TableRow className="font-bold">
                      <TableCell colSpan={3} className="text-right">Total Entradas</TableCell>
                      <TableCell className="text-right text-green-500">
                        ${inflowItems.reduce((sum, item) => sum + (item.amount || 0), 0)
                          .toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            
            {outflowItems.length > 0 && (
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-red-500">
                  <TrendingDown className="mr-1 h-4 w-4" />
                  Salidas
                </h3>
                <Table>
                  <TableHeader className="bg-gray-900 text-white">
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outflowItems.map(item => (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => onEditItem?.(item)}
                      >
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.description || '-'}</TableCell>
                        <TableCell>{sourceLabels[item.source] || item.source}</TableCell>
                        <TableCell className="text-right">
                          ${item.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total row */}
                    <TableRow className="font-bold">
                      <TableCell colSpan={3} className="text-right">Total Salidas</TableCell>
                      <TableCell className="text-right text-red-500">
                        ${outflowItems.reduce((sum, item) => sum + (item.amount || 0), 0)
                          .toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            
            {inflowItems.length === 0 && outflowItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay elementos para esta semana. Haga clic en "Agregar Elemento" para comenzar.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Seleccione una semana de la tabla para ver los detalles.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
