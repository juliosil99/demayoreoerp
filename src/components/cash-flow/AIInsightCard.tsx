
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AIInsightCardProps {
  insights: string;
  isLoading?: boolean;
  isGenerating?: boolean; // Add this prop to support both naming conventions
  onRequestAPIKey: () => void;
  isMobile?: boolean;
}

export function AIInsightCard({ 
  insights, 
  isLoading,
  isGenerating, // Accept the new prop
  onRequestAPIKey,
  isMobile = false
}: AIInsightCardProps) {
  // Use either isLoading or isGenerating (prioritize isGenerating if both are provided)
  const isLoadingState = isGenerating !== undefined ? isGenerating : isLoading;
  
  // Parse insights if available
  let parsedInsights: any = null;
  try {
    if (insights) {
      parsedInsights = JSON.parse(insights);
    }
  } catch (e) {
    console.error("Failed to parse AI insights:", e);
  }
  
  const needsApiKey = !insights && !isLoadingState;
  
  // Different layouts for mobile vs desktop
  if (isMobile) {
    return (
      <div>
        {isLoadingState && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        
        {needsApiKey && (
          <div className="text-center py-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={onRequestAPIKey}
            >
              <Key className="mr-2 h-4 w-4" />
              Configurar OpenAI API Key
            </Button>
          </div>
        )}
        
        {parsedInsights && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Posición de Efectivo:</p>
              <p className="text-muted-foreground">{parsedInsights.cashPosition}</p>
            </div>
            
            <div>
              <p className="font-medium">Recomendaciones:</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                {parsedInsights.recommendations?.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Desktop version
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights de IA</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingState && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        
        {parsedInsights && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Posición de Efectivo:</h4>
              <p className="text-muted-foreground">{parsedInsights.cashPosition}</p>
            </div>
            
            {parsedInsights.payablesAnalysis && (
              <div>
                <h4 className="font-medium">Análisis de Cuentas por Pagar:</h4>
                <p className="text-muted-foreground">{parsedInsights.payablesAnalysis}</p>
              </div>
            )}
            
            {parsedInsights.expenseTrends && (
              <div>
                <h4 className="font-medium">Tendencias de Gastos:</h4>
                <p className="text-muted-foreground">{parsedInsights.expenseTrends}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium">Recomendaciones:</h4>
              <ul className="list-disc pl-5 text-muted-foreground">
                {parsedInsights.recommendations?.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      {needsApiKey && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onRequestAPIKey}
          >
            <Key className="mr-2 h-4 w-4" />
            Configurar OpenAI API Key
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
