
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributionMarginCardProps {
  contributionMargin: number;
  contributionMarginChange?: number;
}

export const ContributionMarginCard = ({ 
  contributionMargin, 
  contributionMarginChange 
}: ContributionMarginCardProps) => {
  const showChange = contributionMarginChange !== undefined;
  const isPositive = contributionMarginChange && contributionMarginChange > 0;
  
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Margen de Contribución</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-center py-4">
          {formatCurrency(contributionMargin)}
          
          {showChange && (
            <span className="ml-3 text-lg">
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              )}>
                {isPositive && "+"}{contributionMarginChange.toFixed(2)}%
                {isPositive ? 
                  <TrendingUp className="h-3 w-3 ml-1" /> : 
                  <TrendingDown className="h-3 w-3 ml-1" />
                }
              </span>
            </span>
          )}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Total de contribuciones en el período seleccionado
        </p>
      </CardContent>
    </Card>
  );
};
