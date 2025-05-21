
import React from "react";
import { useFinancialReports } from "@/hooks/financial-reporting/useFinancialReports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IncomeStatementTable } from "./IncomeStatementTable";
import { DateRangeInfo } from "./components/DateRangeInfo";
import { IncomeStatementProps } from "./types";
import { prepareReportData } from "./utils";

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
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudo cargar el estado de resultados. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Format data for display
  const formattedData = prepareReportData(reportData);

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

export default IncomeStatement;
