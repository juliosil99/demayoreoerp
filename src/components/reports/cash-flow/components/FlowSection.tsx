
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { SectionProps } from "../types";

export const FlowSection: React.FC<SectionProps> = ({
  sectionTitle,
  sectionData,
  compareWithPreviousYear,
  getPreviousValue,
  formatCurrency
}) => {
  return (
    <>
      <TableRow className="bg-muted/50">
        <TableCell colSpan={compareWithPreviousYear ? 4 : 2} className="font-medium">
          {sectionTitle}
        </TableCell>
      </TableRow>
      
      {Object.entries(sectionData).map(([item, amount]) => {
        const previousAmount = compareWithPreviousYear ? getPreviousValue('', item) : undefined;
        const changePercent = compareWithPreviousYear ? 
          calculateChange(Number(amount), previousAmount) : null;
        const isPositiveChange = previousAmount !== undefined && Number(amount) > previousAmount;
        
        return (
          <TableRow key={item}>
            <TableCell className={item.includes('Flujo Neto') ? "font-medium" : "pl-6"}>
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
                  <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
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

const calculateChange = (current: number, previous?: number): string | null => {
  if (previous === undefined || previous === 0) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return change.toFixed(2) + '%';
};
