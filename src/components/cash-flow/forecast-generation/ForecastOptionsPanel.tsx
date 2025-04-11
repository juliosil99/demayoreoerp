
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ForecastOptions } from "./types";

interface ForecastOptionsPanelProps {
  options: ForecastOptions;
  onOptionChange: <K extends keyof ForecastOptions>(option: K, value: ForecastOptions[K]) => void;
}

export function ForecastOptionsPanel({ options, onOptionChange }: ForecastOptionsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opciones de Pronóstico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="useAI" className="flex-1">
              Usar Inteligencia Artificial
              <p className="text-xs text-muted-foreground">
                Generar pronóstico basado en modelos de IA avanzados
              </p>
            </Label>
            <Switch 
              id="useAI" 
              checked={options.useAI}
              onCheckedChange={(checked) => onOptionChange('useAI', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeHistoricalTrends" className="flex-1">
              Incluir Tendencias Históricas
              <p className="text-xs text-muted-foreground">
                Usar datos históricos para identificar tendencias
              </p>
            </Label>
            <Switch 
              id="includeHistoricalTrends" 
              checked={options.includeHistoricalTrends}
              onCheckedChange={(checked) => onOptionChange('includeHistoricalTrends', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeSeasonality" className="flex-1">
              Incluir Estacionalidad
              <p className="text-xs text-muted-foreground">
                Considerar patrones estacionales en las proyecciones
              </p>
            </Label>
            <Switch 
              id="includeSeasonality" 
              checked={options.includeSeasonality}
              onCheckedChange={(checked) => onOptionChange('includeSeasonality', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includePendingPayables" className="flex-1">
              Incluir Cuentas por Pagar Pendientes
              <p className="text-xs text-muted-foreground">
                Incluir cuentas por pagar en la proyección de salidas
              </p>
            </Label>
            <Switch 
              id="includePendingPayables" 
              checked={options.includePendingPayables}
              onCheckedChange={(checked) => onOptionChange('includePendingPayables', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeRecurringExpenses" className="flex-1">
              Incluir Gastos Recurrentes
              <p className="text-xs text-muted-foreground">
                Incluir gastos recurrentes en la proyección
              </p>
            </Label>
            <Switch 
              id="includeRecurringExpenses" 
              checked={options.includeRecurringExpenses}
              onCheckedChange={(checked) => onOptionChange('includeRecurringExpenses', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeCreditPayments" className="flex-1">
              Incluir Pagos de Crédito
              <p className="text-xs text-muted-foreground">
                Incluir pagos futuros de tarjetas y líneas de crédito
              </p>
            </Label>
            <Switch 
              id="includeCreditPayments" 
              checked={options.includeCreditPayments}
              onCheckedChange={(checked) => onOptionChange('includeCreditPayments', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="startWithCurrentBalance" className="flex-1">
              Iniciar con Saldo Actual
              <p className="text-xs text-muted-foreground">
                Usar el saldo disponible actual como punto de partida
              </p>
            </Label>
            <Switch 
              id="startWithCurrentBalance" 
              checked={options.startWithCurrentBalance}
              onCheckedChange={(checked) => onOptionChange('startWithCurrentBalance', checked)} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
