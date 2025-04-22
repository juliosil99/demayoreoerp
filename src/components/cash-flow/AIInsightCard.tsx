
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIInsightCardProps {
  insights?: string | null;
  isLoading?: boolean;
  onUpdateForecast?: () => void;
  onRequestAPIKey?: () => void;
}

export function AIInsightCard({ insights, isLoading, onUpdateForecast, onRequestAPIKey }: AIInsightCardProps) {
  const processInsights = (text: string) => {
    if (!text) return [];
    
    try {
      // Check if the insights string is JSON
      if (text.startsWith("{") || text.startsWith("[")) {
        const data = JSON.parse(text);
        if (data.suggestions) {
          return Array.isArray(data.suggestions) 
            ? data.suggestions 
            : [data.suggestions];
        }
        if (data.insight || data.message) {
          return [data.insight || data.message];
        }
        if (Array.isArray(data)) {
          return data;
        }
        return [JSON.stringify(data)];
      }
      
      // Handle plain text - split by newlines or bullets
      return text
        .split(/\n+|•/)
        .filter(line => line.trim() !== "")
        .map(line => line.trim());
    } catch (e) {
      // If parsing fails, split by newlines
      return text
        .split(/\n+/)
        .filter(line => line.trim() !== "")
        .map(line => line.trim());
    }
  };

  const renderedInsights = insights ? processInsights(insights) : [];
  
  const noInsightsMessage = "No AI insights available for this forecast yet.";

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            AI Insights
          </CardTitle>
          <div className="flex gap-2">
            {onRequestAPIKey && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRequestAPIKey}
                className="text-xs"
              >
                Configure API Key
              </Button>
            )}
            {onUpdateForecast && (
              <Button
                size="sm"
                variant="outline"
                onClick={onUpdateForecast}
                className="text-xs"
              >
                Update Forecast
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {isLoading ? (
          <p className="text-muted-foreground">Loading insights...</p>
        ) : renderedInsights.length > 0 ? (
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              {renderedInsights.map((insight, index) => (
                <li key={index} className="text-sm">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground">{noInsightsMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
