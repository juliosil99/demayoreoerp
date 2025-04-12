
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

interface ForecastSummaryCardsProps {
  initialBalance: number;
  predictedInflows: number;
  predictedOutflows: number;
  endingBalance: number;
  isMobile?: boolean;
}

export function ForecastSummaryCards({
  initialBalance,
  predictedInflows,
  predictedOutflows,
  endingBalance,
  isMobile = false
}: ForecastSummaryCardsProps) {
  const formatValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <>
      <Card>
        <CardContent className={cn(
          "flex flex-col justify-between",
          isMobile ? "pt-4" : "pt-6"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "mb-2" : "mb-4"
          )}>
            <Wallet className={cn(
              "text-blue-500",
              isMobile ? "h-4 w-4 mr-2" : "h-5 w-5 mr-3"
            )} />
            <span className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>Balance Inicial</span>
          </div>
          <div className={isMobile ? "text-base font-semibold" : "text-2xl font-semibold"}>
            {formatValue(initialBalance)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={cn(
          "flex flex-col justify-between",
          isMobile ? "pt-4" : "pt-6"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "mb-2" : "mb-4"
          )}>
            <ArrowDown className={cn(
              "text-green-500",
              isMobile ? "h-4 w-4 mr-2" : "h-5 w-5 mr-3"
            )} />
            <span className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>Entradas de Efectivo</span>
          </div>
          <div className={isMobile ? "text-base font-semibold text-green-600" : "text-2xl font-semibold text-green-600"}>
            {formatValue(predictedInflows)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={cn(
          "flex flex-col justify-between",
          isMobile ? "pt-4" : "pt-6"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "mb-2" : "mb-4"
          )}>
            <ArrowUp className={cn(
              "text-red-500",
              isMobile ? "h-4 w-4 mr-2" : "h-5 w-5 mr-3"
            )} />
            <span className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>Salidas de Efectivo</span>
          </div>
          <div className={isMobile ? "text-base font-semibold text-red-600" : "text-2xl font-semibold text-red-600"}>
            {formatValue(predictedOutflows)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={cn(
          "flex flex-col justify-between",
          isMobile ? "pt-4" : "pt-6"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "mb-2" : "mb-4"
          )}>
            <Wallet className={cn(
              "text-blue-500",
              isMobile ? "h-4 w-4 mr-2" : "h-5 w-5 mr-3"
            )} />
            <span className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>Balance Final</span>
          </div>
          <div className={cn(
            isMobile ? "text-base font-semibold" : "text-2xl font-semibold",
            endingBalance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatValue(endingBalance)}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
