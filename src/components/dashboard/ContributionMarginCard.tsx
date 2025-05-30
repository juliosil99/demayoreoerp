
import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

interface ContributionMarginCardProps {
  contributionMargin: number;
  contributionMarginChange: number;
  hasData?: boolean;
}

export const ContributionMarginCard = ({ 
  contributionMargin, 
  contributionMarginChange,
  hasData = true
}: ContributionMarginCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Margen de Contribución
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {hasData ? formatCurrency(contributionMargin) : "Sin datos"}
        </div>
        
        {hasData && contributionMarginChange !== 0 && (
          <div className="mt-2 flex items-center text-xs">
            <span 
              className={cn(
                "mr-1 rounded-md px-1.5 py-0.5 font-medium",
                contributionMarginChange > 0 && "bg-emerald-100 text-emerald-800",
                contributionMarginChange < 0 && "bg-rose-100 text-rose-800",
                contributionMarginChange === 0 && "bg-gray-100 text-gray-800"
              )}
            >
              {contributionMarginChange > 0 ? "+" : ""}{contributionMarginChange.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">
              {contributionMarginChange > 0 ? "incremento" : "disminución"} desde el último periodo
            </span>
          </div>
        )}
        
        {!hasData && (
          <div className="mt-1 text-xs text-muted-foreground">
            Selecciona un rango de fechas para ver datos reales
          </div>
        )}
      </CardContent>
    </Card>
  );
};
