
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ForecastWeek } from "@/types/cashFlow";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface WeeklyForecastTableProps {
  weeks: ForecastWeek[];
  onSelectWeek?: (week: ForecastWeek) => void;
  selectedWeekId?: string;
}

export function WeeklyForecastTable({ 
  weeks, 
  onSelectWeek,
  selectedWeekId 
}: WeeklyForecastTableProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Detalle Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-900 text-white">
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Salidas</TableHead>
                <TableHead className="text-right">Flujo Neto</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
                <TableHead className="text-center">Gráfico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((week) => {
                const startDate = parseISO(week.week_start_date);
                const endDate = parseISO(week.week_end_date);
                const netCashFlow = (week.predicted_inflows || 0) - (week.predicted_outflows || 0);
                const isSelected = selectedWeekId === week.id;
                
                const barData = [
                  {
                    name: 'Entradas',
                    value: week.predicted_inflows || 0,
                    color: '#10b981'
                  },
                  {
                    name: 'Salidas',
                    value: week.predicted_outflows || 0,
                    color: '#ef4444'
                  }
                ];
                
                return (
                  <TableRow 
                    key={week.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted' : ''}`}
                    onClick={() => onSelectWeek?.(week)}
                  >
                    <TableCell className="font-medium">Semana {week.week_number}</TableCell>
                    <TableCell>
                      {format(startDate, "dd MMM", { locale: es })} - {format(endDate, "dd MMM", { locale: es })}
                    </TableCell>
                    <TableCell className={`text-right ${(week.starting_balance || 0) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      {formatCurrency(week.starting_balance || 0)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {formatCurrency(week.predicted_inflows || 0)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(week.predicted_outflows || 0)}
                    </TableCell>
                    <TableCell className={`text-right ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(netCashFlow)}
                    </TableCell>
                    <TableCell className={`text-right ${(week.ending_balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(week.ending_balance || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="h-10 w-24 mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), ""]}
                              labelFormatter={(_) => ""}
                            />
                            <Bar dataKey="value" barSize={10}>
                              {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
