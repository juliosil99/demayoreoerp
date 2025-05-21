
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { FlowSection } from "./FlowSection";
import { FormattedFlowData } from "../types";
import { formatCurrency } from "../utils";

interface CashFlowTableProps {
  flowData: FormattedFlowData;
  compareWithPreviousYear: boolean;
  getPreviousValue: (section: string, item: string) => number;
}

export const CashFlowTable: React.FC<CashFlowTableProps> = ({
  flowData,
  compareWithPreviousYear,
  getPreviousValue
}) => {
  return (
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
        {/* Operating Activities Section */}
        <FlowSection 
          sectionTitle="ACTIVIDADES OPERATIVAS"
          sectionData={flowData.operating}
          compareWithPreviousYear={compareWithPreviousYear}
          getPreviousValue={(_, item) => getPreviousValue('operating', item)}
          formatCurrency={formatCurrency}
        />
        
        {/* Investing Activities Section */}
        <FlowSection 
          sectionTitle="ACTIVIDADES DE INVERSIÓN"
          sectionData={flowData.investing}
          compareWithPreviousYear={compareWithPreviousYear}
          getPreviousValue={(_, item) => getPreviousValue('investing', item)}
          formatCurrency={formatCurrency}
        />
        
        {/* Financing Activities Section */}
        <FlowSection 
          sectionTitle="ACTIVIDADES DE FINANCIAMIENTO"
          sectionData={flowData.financing}
          compareWithPreviousYear={compareWithPreviousYear}
          getPreviousValue={(_, item) => getPreviousValue('financing', item)}
          formatCurrency={formatCurrency}
        />
        
        {/* Summary Section */}
        <FlowSection 
          sectionTitle="RESUMEN"
          sectionData={flowData.summary}
          compareWithPreviousYear={compareWithPreviousYear}
          getPreviousValue={(_, item) => getPreviousValue('summary', item)}
          formatCurrency={formatCurrency}
        />
      </TableBody>
    </Table>
  );
};
