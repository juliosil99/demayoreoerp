
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeStatement } from "@/components/reports/IncomeStatement";
import { CashFlow } from "@/components/reports/CashFlow";
import { BalanceSheet } from "@/components/reports/BalanceSheet";
import { ChannelIncomeStatement } from "@/components/reports/ChannelIncomeStatement";
import { FinancialPeriodType } from "@/types/financial-reporting";

interface ReportContentProps {
  activeTab: string;
  userId?: string;
  periodId: string;
  periodType: FinancialPeriodType;
  compareWithPreviousYear: boolean;
  periodsExist: boolean;
}

export function ReportContent({
  activeTab,
  userId,
  periodId,
  periodType,
  compareWithPreviousYear,
  periodsExist
}: ReportContentProps) {
  const renderEmptyState = () => (
    <p className="text-center text-gray-500 py-8">
      {!periodsExist
        ? "No hay períodos financieros. Haga clic en 'Crear Períodos' para comenzar."
        : "Seleccione un período para ver el reporte"}
    </p>
  );

  if (activeTab === "income") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Estado de Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {periodId ? (
            <IncomeStatement 
              userId={userId} 
              periodId={periodId}
              periodType={periodType}
              compareWithPreviousYear={compareWithPreviousYear}
            />
          ) : renderEmptyState()}
        </CardContent>
      </Card>
    );
  } else if (activeTab === "cash-flow") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Flujo de Efectivo</CardTitle>
        </CardHeader>
        <CardContent>
          {periodId ? (
            <CashFlow 
              userId={userId} 
              periodId={periodId}
              periodType={periodType}
              compareWithPreviousYear={compareWithPreviousYear}
            />
          ) : renderEmptyState()}
        </CardContent>
      </Card>
    );
  } else if (activeTab === "balance") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Balance General</CardTitle>
        </CardHeader>
        <CardContent>
          {periodId ? (
            <BalanceSheet 
              userId={userId} 
              periodId={periodId}
              periodType={periodType}
              compareWithPreviousYear={compareWithPreviousYear}
            />
          ) : renderEmptyState()}
        </CardContent>
      </Card>
    );
  } else if (activeTab === "channel-income") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Estado de Resultados por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          {periodId ? (
            <ChannelIncomeStatement 
              userId={userId} 
              periodId={periodId}
            />
          ) : renderEmptyState()}
        </CardContent>
      </Card>
    );
  }

  return null;
}
