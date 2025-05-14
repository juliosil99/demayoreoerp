
import React from "react";
import { ContributionMarginCard } from "@/components/dashboard/ContributionMarginCard";

interface ContributionMarginSectionProps {
  contributionMargin: number;
  contributionMarginChange?: number;
}

export const ContributionMarginSection = ({ 
  contributionMargin,
  contributionMarginChange 
}: ContributionMarginSectionProps) => {
  return (
    <ContributionMarginCard 
      contributionMargin={contributionMargin} 
      contributionMarginChange={contributionMarginChange}
    />
  );
};
