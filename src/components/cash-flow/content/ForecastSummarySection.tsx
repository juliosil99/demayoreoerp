
import React from "react";
import { ForecastWeek, CashFlowForecast } from "@/types/cashFlow";
import { ForecastSummaryCards } from "@/components/cash-flow/ForecastSummaryCards";

interface ForecastSummarySectionProps {
  weeks: ForecastWeek[];
  forecast?: CashFlowForecast | null;
}

export function ForecastSummarySection({ weeks, forecast }: ForecastSummarySectionProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <ForecastSummaryCards weeks={weeks} forecast={forecast} />
    </div>
  );
}
