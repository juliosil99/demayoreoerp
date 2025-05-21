
import React from "react";
import { useFinancialReports } from "@/hooks/financial-reporting/useFinancialReports";
import { IncomeStatementProps } from "./types";
import { prepareReportData } from "./utils";
import { IncomeStatementLoading } from "./components/IncomeStatementLoading";
import { IncomeStatementError } from "./components/IncomeStatementError";
import { IncomeStatementContent } from "./components/IncomeStatementContent";

export const IncomeStatement: React.FC<IncomeStatementProps> = ({
  userId,
  periodId,
  periodType,
  compareWithPreviousYear = false
}) => {
  // Fetch the report data
  const { reportData, isLoading, error } = useFinancialReports('income_statement', {
    periodId,
    periodType,
    compareWithPreviousYear,
    year: 0 // Dummy value, won't be used since periodId is provided
  });

  if (isLoading) {
    return <IncomeStatementLoading />;
  }

  if (error) {
    return <IncomeStatementError error={error} />;
  }

  // Format data for display
  const formattedData = prepareReportData(reportData);

  return (
    <IncomeStatementContent 
      reportData={reportData}
      formattedData={formattedData}
      compareWithPreviousYear={compareWithPreviousYear}
    />
  );
};

export default IncomeStatement;
