
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIInsightCardProps {
  insights: string;
  isLoading?: boolean;
  onRequestAPIKey?: () => void;
}

export function AIInsightCard({ insights, isLoading, onRequestAPIKey }: AIInsightCardProps) {
  // Check if insights contain an API key error message
  const isApiKeyMissing = insights?.includes("No se pudieron generar insights debido a un error") || 
                          insights?.includes("API key");
  
  // Split insights by sections
  const formatInsights = (insightsText: string) => {
    if (!insightsText) return null;
    
    // Replace section numbers with headers
    const formattedText = insightsText
      .replace(/1\. Analysis of Cash Flow Trend:/gi, '## Análisis de Tendencia de Flujo de Efectivo')
      .replace(/2\. Weeks with Potential Cash Flow Issues:/gi, '## Semanas con Posibles Problemas de Liquidez')
      .replace(/3\. Cash Flow Patterns:/gi, '## Patrones de Flujo de Efectivo')
      .replace(/4\. Cash Flow Optimization Suggestions:/gi, '## Sugerencias de Optimización')
      .replace(/5\. Risks and Opportunities:/gi, '## Riesgos y Oportunidades')
      .replace(/\d+\.\s/g, '• '); // Replace numbered lists with bullet points
    
    // Replace markdown headings with styled divs
    return formattedText.split('##').map((section, index) => {
      if (!section.trim()) return null;
      
      const [title, ...content] = section.split('\n');
      return (
        <div key={index} className="mb-4">
          {title && <h3 className="text-lg font-semibold mt-4">{title.trim()}</h3>}
          <div className="mt-2">
            {content.map((paragraph, idx) => (
              paragraph.trim() ? 
                <p key={idx} className="mb-2">{paragraph.trim()}</p> : 
                null
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Análisis de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : isApiKeyMissing && onRequestAPIKey ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div className="flex items-center text-amber-500 gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Se requiere una clave API de OpenAI para generar análisis.</span>
            </div>
            <Button onClick={onRequestAPIKey} variant="outline">
              Configurar API Key de OpenAI
            </Button>
          </div>
        ) : insights ? (
          <div className="text-sm text-muted-foreground">
            {formatInsights(insights)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Genere un pronóstico para obtener análisis de IA sobre su flujo de efectivo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
