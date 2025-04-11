
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, BarChart, SparklesIcon, Calendar, Banknote } from "lucide-react";

interface ForecastOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: boolean;
}

interface ForecastOptionsPanelProps {
  options: {
    useAI: boolean;
    includeHistoricalTrends: boolean;
    includeSeasonality: boolean;
    includePendingPayables: boolean;
    includeRecurringExpenses: boolean;
  };
  onOptionChange: (option: string, value: boolean) => void;
}

export function ForecastOptionsPanel({ options, onOptionChange }: ForecastOptionsPanelProps) {
  // Define all options with their icons and labels
  const forecastOptions: ForecastOption[] = [
    {
      id: "useAI",
      label: "Usar Inteligencia Artificial",
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      value: options.useAI
    },
    {
      id: "includeHistoricalTrends",
      label: "Incluir Tendencias Históricas",
      icon: <BarChart className="h-5 w-5 text-blue-500" />,
      value: options.includeHistoricalTrends
    },
    {
      id: "includeSeasonality",
      label: "Considerar Estacionalidad",
      icon: <SparklesIcon className="h-5 w-5 text-amber-500" />,
      value: options.includeSeasonality
    },
    {
      id: "includePendingPayables",
      label: "Incluir Cuentas Pendientes",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      value: options.includePendingPayables
    },
    {
      id: "includeRecurringExpenses",
      label: "Incluir Gastos Recurrentes",
      icon: <Banknote className="h-5 w-5 text-red-500" />,
      value: options.includeRecurringExpenses
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Opciones de Pronóstico</h3>
      
      <div className="space-y-3">
        {forecastOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {option.icon}
              <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
            </div>
            <Switch
              id={option.id}
              checked={option.value}
              onCheckedChange={(checked) => onOptionChange(option.id, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
