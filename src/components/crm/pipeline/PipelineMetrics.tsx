
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { Opportunity, PipelineStage } from '@/types/pipeline';
import { formatCurrency } from '@/utils/formatters';

interface PipelineMetricsProps {
  opportunities: Opportunity[];
  stages: PipelineStage[];
}

export const PipelineMetrics = ({ opportunities, stages }: PipelineMetricsProps) => {
  // Calculate conversion rates between stages
  const stageConversions = stages.map((stage, index) => {
    const currentStageOpps = opportunities.filter(opp => opp.stage_id === stage.id);
    const nextStage = stages[index + 1];
    
    if (!nextStage) return null;
    
    const nextStageOpps = opportunities.filter(opp => opp.stage_id === nextStage.id);
    const conversionRate = currentStageOpps.length > 0 
      ? (nextStageOpps.length / currentStageOpps.length) * 100 
      : 0;

    return {
      fromStage: stage.name,
      toStage: nextStage.name,
      rate: conversionRate,
      fromCount: currentStageOpps.length,
      toCount: nextStageOpps.length
    };
  }).filter(Boolean);

  // Calculate average time in each stage (simulated for now)
  const stageMetrics = stages.map(stage => {
    const stageOpps = opportunities.filter(opp => opp.stage_id === stage.id);
    const avgDays = Math.floor(Math.random() * 30) + 5; // Simulated
    const stuckOpps = stageOpps.filter(opp => {
      const daysSince = Math.floor((Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > avgDays * 2;
    });

    return {
      stage,
      count: stageOpps.length,
      avgDays,
      stuckCount: stuckOpps.length,
      totalValue: stageOpps.reduce((sum, opp) => sum + opp.value, 0)
    };
  });

  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedProbability = opportunities.length > 0 
    ? opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Pipeline Value */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Valor Total Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
          <div className="text-xs text-muted-foreground">
            {opportunities.length} oportunidades
          </div>
        </CardContent>
      </Card>

      {/* Weighted Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Valor Ponderado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(weightedProbability)}
          </div>
          <div className="text-xs text-muted-foreground">
            Basado en probabilidades
          </div>
        </CardContent>
      </Card>

      {/* Average Deal Size */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Tamaño Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(opportunities.length > 0 ? totalPipelineValue / opportunities.length : 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            Por oportunidad
          </div>
        </CardContent>
      </Card>

      {/* Stuck Opportunities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            Oportunidades Estancadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stageMetrics.reduce((sum, metric) => sum + metric.stuckCount, 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            Requieren atención
          </div>
        </CardContent>
      </Card>

      {/* Stage Conversion Rates */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tasas de Conversión por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stageConversions.map((conversion, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{conversion.fromStage} → {conversion.toStage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {conversion.fromCount} → {conversion.toCount}
                    </span>
                    <Badge variant={conversion.rate >= 50 ? "default" : "secondary"}>
                      {conversion.rate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={conversion.rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Performance */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Rendimiento por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stageMetrics.map((metric) => (
              <div key={metric.stage.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{metric.stage.name}</h4>
                  <Badge variant="outline">{metric.count}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(metric.totalValue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Promedio: {metric.avgDays} días
                </div>
                {metric.stuckCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {metric.stuckCount} estancadas
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
