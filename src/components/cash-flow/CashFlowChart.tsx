
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { ForecastWeek, ChartData } from "@/types/cashFlow";

interface CashFlowChartProps {
  weeks: ForecastWeek[];
}

export function CashFlowChart({ weeks }: CashFlowChartProps) {
  // Transform the data for the chart
  const chartData: ChartData[] = weeks.map(week => ({
    name: `Sem ${week.week_number}`,
    inflows: Number(week.predicted_inflows),
    outflows: Number(week.predicted_outflows),
    netCashFlow: Number(week.net_cash_flow || 0),
    cumulativeCashFlow: Number(week.cumulative_cash_flow || 0)
  }));

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Pronóstico de Flujo de Efectivo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => {
                  return [`$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, ""];
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="gray" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="inflows" 
                stroke="#10b981" 
                name="Entradas" 
                dot={{ strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="outflows" 
                stroke="#ef4444" 
                name="Salidas" 
                dot={{ strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="netCashFlow" 
                stroke="#3b82f6" 
                name="Flujo Neto"
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeCashFlow" 
                stroke="#8b5cf6" 
                name="Flujo Acumulado" 
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
