
import React from "react";
import { SalesChannelDistribution } from "@/components/dashboard/channel-distribution";
import { DateRange } from "react-day-picker";

interface ChannelDistributionSectionProps {
  dateRange?: DateRange;
}

export const ChannelDistributionSection = ({ dateRange }: ChannelDistributionSectionProps) => {
  return <SalesChannelDistribution dateRange={dateRange} />;
};
