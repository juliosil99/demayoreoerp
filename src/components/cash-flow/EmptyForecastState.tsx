
import React from "react";
import { Button } from "@/components/ui/button";
import { LineChart, PlusCircle, Key, Database } from "lucide-react";

interface EmptyForecastStateProps {
  isLoading: boolean;
  forecastsCount: number;
  selectedForecastId?: string;
  hasWeeks: boolean;
  onCreateClick: () => void;
  onConfigureAPIKeyClick: () => void;
  onGenerateClick: () => void;
  isGenerating: boolean;
}

export function EmptyForecastState({
  isLoading,
  forecastsCount,
  selectedForecastId,
  hasWeeks,
  onCreateClick,
  onConfigureAPIKeyClick,
  onGenerateClick,
  isGenerating
}: EmptyForecastStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  if (forecastsCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <LineChart className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No hay pronósticos</h2>
        <p className="text-muted-foreground mb-6">
          Cree un nuevo pronóstico para comenzar a planificar su flujo de efectivo
        </p>
        <div className="flex flex-col space-y-4 items-center">
          <Button onClick={onCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Pronóstico
          </Button>
          
          <Button
            onClick={onConfigureAPIKeyClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Configurar API Key de OpenAI
          </Button>
        </div>
      </div>
    );
  }

  if (selectedForecastId && !hasWeeks) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Database className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pronóstico sin datos</h2>
        <p className="text-muted-foreground mb-6">
          Genere el pronóstico para ver proyecciones de flujo de efectivo
        </p>
        <div className="flex flex-col space-y-4 items-center">
          <Button 
            onClick={onGenerateClick}
            disabled={isGenerating}
          >
            <LineChart className="mr-2 h-4 w-4" />
            Generar Pronóstico
          </Button>
          
          <Button
            onClick={onConfigureAPIKeyClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Configurar API Key de OpenAI
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
