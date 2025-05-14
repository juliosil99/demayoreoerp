
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface ContributionMarginCardProps {
  contributionMargin: number;
}

export const ContributionMarginCard = ({ contributionMargin }: ContributionMarginCardProps) => {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Margen de Contribución</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-center py-4">
          {formatCurrency(contributionMargin)}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Total de ganancias en el período seleccionado
        </p>
      </CardContent>
    </Card>
  );
};
