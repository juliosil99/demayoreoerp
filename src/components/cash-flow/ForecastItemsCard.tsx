
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ForecastItem } from "@/types/cashFlow";

export interface ForecastItemsCardProps {
  items: ForecastItem[];
  weekId: string;
  forecastId: string;
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
}

export function ForecastItemsCard({
  items,
  weekId,
  forecastId,
  onAddItem,
  onEditItem
}: ForecastItemsCardProps) {
  // Group items by type
  const inflows = items.filter(item => item.type === 'inflow');
  const outflows = items.filter(item => item.type === 'outflow');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Detalles del Pronóstico</span>
          <Button size="sm" variant="outline" onClick={onAddItem}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Agregar</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {inflows.length === 0 && outflows.length === 0 ? (
          <div className="text-muted-foreground text-center py-6">
            No hay elementos para esta semana. 
            Haga clic en "Agregar" para crear uno nuevo.
          </div>
        ) : (
          <div className="space-y-4">
            {inflows.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Ingresos</h3>
                <div className="space-y-2">
                  {inflows.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onEditItem(item)} 
                      className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between"
                    >
                      <div>
                        <div className="font-medium">{item.category}</div>
                        {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
                      </div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {outflows.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Egresos</h3>
                <div className="space-y-2">
                  {outflows.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onEditItem(item)}
                      className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between"
                    >
                      <div>
                        <div className="font-medium">{item.category}</div>
                        {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
                      </div>
                      <div className="font-medium text-red-600">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {(inflows.length > 0 || outflows.length > 0) && (
        <CardFooter className="pt-2">
          <Button variant="ghost" className="w-full" onClick={onAddItem}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Agregar nuevo elemento</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
