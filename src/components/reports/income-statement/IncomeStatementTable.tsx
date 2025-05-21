
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportData } from "@/types/financial-reporting";
import { ReportSection } from "./components/ReportSection";
import { NoDataMessage } from "./components/NoDataMessage";
import { FormattedReportData } from "./types";
import { formatCurrency, getPreviousValueHelper } from "./utils";

interface IncomeStatementTableProps {
  reportData?: ReportData;
  formattedData: FormattedReportData;
  compareWithPreviousYear: boolean;
}

export const IncomeStatementTable: React.FC<IncomeStatementTableProps> = ({ 
  reportData,
  formattedData, 
  compareWithPreviousYear 
}) => {
  const { revenue, expenses, summary } = formattedData;
  
  // Helper function to get previous values
  const getPreviousValue = (section: string, item: string) => {
    return getPreviousValueHelper(reportData, section, item);
  };

  const hasData = reportData && 
    Object.keys(reportData.currentPeriod?.data || {}).length > 0;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Concepto</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            {compareWithPreviousYear && (
              <>
                <TableHead className="text-right">Año Anterior</TableHead>
                <TableHead className="text-right">Variación</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <ReportSection 
            sectionTitle="INGRESOS" 
            sectionData={revenue} 
            compareWithPreviousYear={compareWithPreviousYear}
            getPreviousValue={getPreviousValue}
            formatCurrency={formatCurrency}
          />
          
          <ReportSection 
            sectionTitle="GASTOS" 
            sectionData={expenses} 
            compareWithPreviousYear={compareWithPreviousYear}
            getPreviousValue={getPreviousValue}
            formatCurrency={formatCurrency}
          />
          
          <ReportSection 
            sectionTitle="RESULTADOS" 
            sectionData={summary} 
            compareWithPreviousYear={compareWithPreviousYear}
            getPreviousValue={getPreviousValue}
            formatCurrency={formatCurrency}
          />
        </TableBody>
      </Table>
      
      <NoDataMessage hasData={!!hasData} />
    </>
  );
};
