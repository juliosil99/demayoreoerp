
import React from "react";
import { CashFlowForecast, ForecastWeek } from "@/types/cashFlow";
import { ForecastSummaryCards } from "@/components/cash-flow/ForecastSummaryCards";
import { useIsMobile } from "@/hooks/use-mobile";

interface ForecastSummarySectionProps {
  weeks: ForecastWeek[];
  forecast?: CashFlowForecast | null;
}

export function ForecastSummarySection({ weeks, forecast }: ForecastSummarySectionProps) {
  const isMobile = useIsMobile();
  
  // Calculate key metrics
  const totalPredictedInflows = weeks.reduce((sum, week) => sum + week.predicted_inflows, 0);
  const totalPredictedOutflows = weeks.reduce((sum, week) => sum + week.predicted_outflows, 0);
  const netCashFlow = totalPredictedInflows - totalPredictedOutflows;
  
  // Get beginning and ending balance
  const initialBalance = forecast?.available_cash_balance || 0;
  const endingBalance = initialBalance + netCashFlow;

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
      <ForecastSummaryCards 
        initialBalance={initialBalance}
        predictedInflows={totalPredictedInflows}
        predictedOutflows={totalPredictedOutflows}
        endingBalance={endingBalance}
        isMobile={isMobile}
      />
    </div>
  );
}
