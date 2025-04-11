
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, BarChart, SparklesIcon, Calendar, Banknote, TrendingUp, Gauge } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ForecastOptions } from "./types";

interface ForecastOption {
  id: keyof ForecastOptions;
  label: string;
  icon: React.ReactNode;
  type: "switch" | "slider" | "number";
  value: any;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

interface ForecastOptionsPanelProps {
  options: ForecastOptions;
  onOptionChange: <K extends keyof ForecastOptions>(option: K, value: ForecastOptions[K]) => void;
}

export function ForecastOptionsPanel({ options, onOptionChange }: ForecastOptionsPanelProps) {
  // Define all options with their icons and labels
  const forecastOptions: ForecastOption[] = [
    {
      id: "useAI",
      label: "Usar Inteligencia Artificial",
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      type: "switch",
      value: options.useAI,
      description: "Utiliza modelos de IA para mejorar las predicciones"
    },
    {
      id: "includeHistoricalTrends",
      label: "Incluir Tendencias Históricas",
      icon: <BarChart className="h-5 w-5 text-blue-500" />,
      type: "switch",
      value: options.includeHistoricalTrends,
      description: "Analiza datos históricos para identificar tendencias"
    },
    {
      id: "includeSeasonality",
      label: "Considerar Estacionalidad",
      icon: <SparklesIcon className="h-5 w-5 text-amber-500" />,
      type: "switch",
      value: options.includeSeasonality,
      description: "Ajusta las predicciones según patrones estacionales"
    },
    {
      id: "includePendingPayables",
      label: "Incluir Cuentas Pendientes",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      type: "switch",
      value: options.includePendingPayables,
      description: "Incluye pagos pendientes en las proyecciones"
    },
    {
      id: "includeRecurringExpenses",
      label: "Incluir Gastos Recurrentes",
      icon: <Banknote className="h-5 w-5 text-red-500" />,
      type: "switch",
      value: options.includeRecurringExpenses,
      description: "Considera gastos que se repiten periódicamente"
    },
    {
      id: "forecastHorizonWeeks",
      label: "Horizonte de Pronóstico (Semanas)",
      icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
      type: "number",
      value: options.forecastHorizonWeeks || 13,
      min: 4,
      max: 52,
      step: 1,
      description: "Número de semanas para proyectar"
    },
    {
      id: "confidenceLevel",
      label: "Nivel de Confianza",
      icon: <Gauge className="h-5 w-5 text-teal-500" />,
      type: "slider",
      value: (options.confidenceLevel || 0.8) * 100,
      min: 50,
      max: 95,
      step: 5,
      description: "Nivel de confianza para las predicciones (%)"
    },
  ];

  const handleSliderChange = (option: keyof ForecastOptions, value: number[]) => {
    if (option === "confidenceLevel") {
      onOptionChange(option, value[0] / 100); // Convert percentage back to decimal
    } else {
      onOptionChange(option, value[0]);
    }
  };

  const handleNumberChange = (option: keyof ForecastOptions, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      onOptionChange(option, value);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Opciones de Pronóstico</h3>
      
      <div className="space-y-5">
        {forecastOptions.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {option.icon}
                <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
              </div>
              
              {option.type === "switch" && (
                <Switch
                  id={option.id}
                  checked={option.value}
                  onCheckedChange={(checked) => onOptionChange(option.id, checked)}
                />
              )}
            </div>
            
            {option.description && (
              <p className="text-xs text-muted-foreground ml-7">{option.description}</p>
            )}
            
            {option.type === "slider" && (
              <div className="pt-2">
                <Slider
                  id={option.id}
                  defaultValue={[option.value]}
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  onValueChange={(value) => handleSliderChange(option.id, value)}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{option.min}%</span>
                  <span className="text-xs font-medium">{option.value}%</span>
                  <span className="text-xs text-muted-foreground">{option.max}%</span>
                </div>
              </div>
            )}
            
            {option.type === "number" && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="number"
                  id={option.id}
                  value={option.value}
                  onChange={(e) => handleNumberChange(option.id, e)}
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  className="w-20 h-8 px-2 border border-input rounded-md text-sm"
                />
                <span className="text-xs text-muted-foreground">semanas</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
