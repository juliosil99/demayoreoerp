
import React from "react";
import { SalesStateDistribution } from "@/components/dashboard/state-distribution";
import { DateRange } from "react-day-picker";

interface StateDistributionSectionProps {
  dateRange?: DateRange;
}

export const StateDistributionSection = ({ dateRange }: StateDistributionSectionProps) => {
  return <SalesStateDistribution dateRange={dateRange} />;
};
