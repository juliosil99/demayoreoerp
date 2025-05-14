
import React from "react";
import { ContributionMarginCard } from "@/components/dashboard/ContributionMarginCard";

interface ContributionMarginSectionProps {
  contributionMargin: number;
}

export const ContributionMarginSection = ({ contributionMargin }: ContributionMarginSectionProps) => {
  return <ContributionMarginCard contributionMargin={contributionMargin} />;
};
