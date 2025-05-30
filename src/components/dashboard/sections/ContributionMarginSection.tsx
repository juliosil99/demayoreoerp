
import React from "react";
import { ContributionMarginCard } from "@/components/dashboard/ContributionMarginCard";

interface ContributionMarginSectionProps {
  contributionMargin: number;
  contributionMarginChange: number;
}

export const ContributionMarginSection = ({ 
  contributionMargin, 
  contributionMarginChange 
}: ContributionMarginSectionProps) => {
  const hasData = contributionMargin > 0;
  
  return (
    <ContributionMarginCard 
      contributionMargin={contributionMargin}
      contributionMarginChange={hasData ? contributionMarginChange : 0}
      hasData={hasData}
    />
  );
};
