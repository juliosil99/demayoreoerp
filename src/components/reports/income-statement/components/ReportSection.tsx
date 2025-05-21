
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { ReportSectionProps } from "../types";
import { calculateChange } from "../utils";

export const ReportSection: React.FC<ReportSectionProps> = ({ 
  sectionTitle, 
  sectionData, 
  compareWithPreviousYear, 
  getPreviousValue, 
  formatCurrency 
}) => {
  const sectionKey = sectionTitle === "INGRESOS" ? "revenue" : 
                     sectionTitle === "GASTOS" ? "expenses" : "summary";
  
  // Determine if higher values are positive for this section
  const isPositiveGood = sectionKey !== "expenses";

  return (
    <>
      <TableRow className="bg-muted/50">
        <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
          {sectionTitle}
        </TableCell>
      </TableRow>
      
      {Object.entries(sectionData).map(([item, amount]) => {
        const previousAmount = compareWithPreviousYear ? getPreviousValue(sectionKey, item) : undefined;
        const changePercent = compareWithPreviousYear ? calculateChange(Number(amount), previousAmount) : null;
        
        // For expenses, higher values are negative; for revenue and summary, higher is positive
        const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
        const isGoodChange = (isPositiveGood && isPositiveChange) || (!isPositiveGood && !isPositiveChange);
        
        return (
          <TableRow key={item}>
            <TableCell className={item.includes('Total') ? "font-medium" : (sectionKey !== "summary" ? "pl-6" : "font-medium")}>
              {item}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(Number(amount))}
            </TableCell>
            {compareWithPreviousYear && (
              <>
                <TableCell className="text-right">
                  {formatCurrency(previousAmount!)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={isGoodChange ? "text-green-600" : "text-red-600"}>
                    {isPositiveChange ? "+" : ""}{changePercent}
                  </span>
                </TableCell>
              </>
            )}
          </TableRow>
        );
      })}
    </>
  );
};
