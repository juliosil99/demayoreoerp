
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useAdvancedPerformanceMonitor } from '@/hooks/useAdvancedPerformanceMonitor';
import { Activity, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export function PerformanceDashboard() {
  const { metrics, isEnabled, setIsEnabled, queryHistory } = useAdvancedPerformanceMonitor();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      dashboard: 'bg-blue-500',
      banking: 'bg-green-500',
      sales: 'bg-purple-500',
      expenses: 'bg-orange-500',
      general: 'bg-gray-500'
    };
    return colors[category] || colors.general;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Performance</h2>
          <p className="text-muted-foreground">
            Análisis en tiempo real del rendimiento de queries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="performance-monitoring" className="text-sm font-medium">
            Monitoreo Activo
          </label>
          <Switch
            id="performance-monitoring"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics.averageResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo de respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Lentas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.slowQueries.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {`> 2 segundos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratio de Errores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas queries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Queries por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.queriesByCategory).map(([category, count]) => {
              const percentage = (count / metrics.totalQueries) * 100;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} 
                    />
                    <span className="capitalize font-medium">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {count} queries
                    </span>
                    <Progress value={percentage} className="w-20" />
                    <span className="text-xs text-muted-foreground w-10">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top queries lentas */}
      {metrics.topSlowQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Queries Lentas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topSlowQueries.map((query, index) => (
                <div 
                  key={`${query.queryName}-${query.timestamp.getTime()}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{query.queryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {query.category} • {query.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatDuration(query.duration)}
                    </p>
                    {query.recordCount && (
                      <p className="text-xs text-muted-foreground">
                        {query.recordCount} registros
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {queryHistory.map((query, index) => (
              <div 
                key={`${query.queryName}-${query.timestamp.getTime()}-${index}`}
                className="flex items-center justify-between text-sm py-1"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      query.status === 'error' ? 'bg-red-500' :
                      query.duration > 2000 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                  />
                  <span className="truncate max-w-xs">{query.queryName}</span>
                  <Badge variant="outline" className="text-xs">
                    {query.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDuration(query.duration)}</span>
                  <span>{query.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
