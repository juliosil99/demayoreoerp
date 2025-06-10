
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Clock, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdvancedPerformanceMonitor } from '@/hooks/useAdvancedPerformanceMonitor';

export function PerformanceDashboard() {
  const { 
    metrics, 
    isEnabled, 
    setIsEnabled, 
    queryHistory 
  } = useAdvancedPerformanceMonitor();

  const getStatusColor = (responseTime: number) => {
    if (responseTime < 1000) return 'text-green-500';
    if (responseTime < 2000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (responseTime: number) => {
    if (responseTime < 1000) return <Badge variant="default" className="bg-green-500">Excelente</Badge>;
    if (responseTime < 2000) return <Badge variant="secondary">Bueno</Badge>;
    return <Badge variant="destructive">Lento</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Performance</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del rendimiento de queries y operaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isEnabled ? "default" : "outline"} 
            onClick={() => setIsEnabled(!isEnabled)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isEnabled ? 'Desactivar' : 'Activar'} Monitor
          </Button>
        </div>
      </div>

      {!isEnabled && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Monitor Desactivado</AlertTitle>
          <AlertDescription>
            El monitor de performance está desactivado. Actívalo para ver métricas en tiempo real.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries}</div>
            <div className="text-xs text-muted-foreground">
              en la sesión actual
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.averageResponseTime)}`}>
              {metrics.averageResponseTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-muted-foreground">
              tiempo de respuesta
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Lentas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.slowQueries.length}</div>
            <div className="text-xs text-muted-foreground">
              > 2 segundos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              de las queries
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.queriesByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{count} queries</span>
                  <Progress 
                    value={(count / metrics.totalQueries) * 100} 
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top queries más lentas */}
      {metrics.topSlowQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Queries Más Lentas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topSlowQueries.slice(0, 5).map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{query.queryName}</div>
                    <div className="text-xs text-muted-foreground">
                      {query.category} • {query.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${getStatusColor(query.duration)}`}>
                      {query.duration.toFixed(0)}ms
                    </span>
                    {getStatusBadge(query.duration)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial reciente */}
      {queryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queryHistory.slice(-10).reverse().map((query, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{query.queryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {query.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`font-mono ${getStatusColor(query.duration)}`}>
                      {query.duration.toFixed(0)}ms
                    </span>
                    {query.status === 'error' && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
