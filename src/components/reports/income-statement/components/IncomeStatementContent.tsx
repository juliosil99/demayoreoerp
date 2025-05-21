
import React from "react";
import { DateRangeInfo } from "./DateRangeInfo";
import { IncomeStatementTable } from "../IncomeStatementTable";
import { ReportData } from "@/types/financial-reporting";
import { FormattedReportData } from "../types";

interface IncomeStatementContentProps {
  reportData?: ReportData;
  formattedData: FormattedReportData;
  compareWithPreviousYear: boolean;
}

export const IncomeStatementContent: React.FC<IncomeStatementContentProps> = ({
  reportData,
  formattedData,
  compareWithPreviousYear,
}) => {
  // Handle export to Excel/PDF
  const handleExport = () => {
    // Implement export functionality
    alert("Export functionality will be implemented soon");
  };

  return (
    <div>
      <DateRangeInfo reportData={reportData} onExport={handleExport} />
      
      <IncomeStatementTable 
        reportData={reportData}
        formattedData={formattedData} 
        compareWithPreviousYear={compareWithPreviousYear} 
      />
    </div>
  );
};
