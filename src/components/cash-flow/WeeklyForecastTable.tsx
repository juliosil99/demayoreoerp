
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ForecastWeek } from "@/types/cashFlow";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface WeeklyForecastTableProps {
  weeks: ForecastWeek[];
  selectedWeek?: ForecastWeek; // Add this line
  selectedWeekId?: string;
  onSelectWeek: (week: ForecastWeek) => void;
}

export function WeeklyForecastTable({
  weeks,
  selectedWeek, // Add this line
  selectedWeekId,
  onSelectWeek
}: WeeklyForecastTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PP', { locale: es });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Semana</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead className="text-right">Egresos</TableHead>
            <TableHead className="text-right">Balance Neto</TableHead>
            <TableHead className="text-right">Balance Acumulado</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks.map((week) => (
            <TableRow 
              key={week.id}
              className={
                (selectedWeek?.id === week.id || selectedWeekId === week.id)
                  ? "bg-muted/50"
                  : undefined
              }
            >
              <TableCell className="font-medium">Sem {week.week_number}</TableCell>
              <TableCell>
                {formatDate(week.week_start_date)} - {formatDate(week.week_end_date)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(week.predicted_inflows)}
              </TableCell>
              <TableCell className="text-right text-red-600">
                {formatCurrency(week.predicted_outflows)}
              </TableCell>
              <TableCell className={`text-right ${(week.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(week.net_cash_flow || 0)}
              </TableCell>
              <TableCell className={`text-right ${(week.cumulative_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(week.cumulative_cash_flow || 0)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectWeek(week)}
                >
                  Detalles
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
