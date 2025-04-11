
import React from "react";
import { ForecastWeek } from "@/types/cashFlow";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";

interface ForecastChartSectionProps {
  weeks: ForecastWeek[];
}

export function ForecastChartSection({ weeks }: ForecastChartSectionProps) {
  return <CashFlowChart weeks={weeks} />;
}
