
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  Database, 
  TrendingUp,
  BarChart3,
  Zap,
  DollarSign
} from 'lucide-react';
import { useRealEgressMonitor } from '@/hooks/useRealEgressMonitor';
import { formatBytes } from '@/utils/formatters';

export function RealEgressDashboard() {
  const { 
    metrics, 
    alerts, 
    isLoading, 
    acknowledgeAlert, 
    clearAcknowledgedAlerts, 
    refreshMetrics,
    resetTracker
  } = useRealEgressMonitor();

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 300) return 'bg-red-500';
    if (percentage > 150) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Egress Real</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del uso de datos con mediciones reales
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-sm text-blue-600">
              <Activity className="h-3 w-3" />
              Interceptando requests en tiempo real
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            variant="secondary" 
            onClick={resetTracker}
          >
            <Zap className="h-4 w-4 mr-2" />
            Reset Tracker
          </Button>
          {unacknowledgedAlerts.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={clearAcknowledgedAlerts}
            >
              Limpiar Alertas ({unacknowledgedAlerts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Alertas activas */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-2">
          {unacknowledgedAlerts.map((alert) => (
            <Alert 
              key={alert.id} 
              variant={alert.level === 'critical' ? 'destructive' : 'default'}
            >
              {getAlertIcon(alert.level)}
              <AlertTitle className="flex items-center justify-between">
                <span>Alerta de Egress Real - {alert.level.toUpperCase()}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Reconocer
                </Button>
              </AlertTitle>
              <AlertDescription>
                {alert.message}
                {alert.source && (
                  <div className="mt-1 text-xs">
                    <strong>Fuente:</strong> {alert.source} • <strong>Bytes:</strong> {formatBytes(alert.bytes)}
                  </div>
                )}
                <br />
                <small className="text-muted-foreground">
                  {alert.timestamp.toLocaleString()}
                </small>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egress Hoy (Real)</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.totalBytesToday)}
            </div>
            <div className="text-xs text-muted-foreground">
              vs límite {formatBytes(metrics.dailyLimit)}
            </div>
            <Progress 
              value={Math.min(metrics.usagePercentage, 100)} 
              className="mt-2"
              color={getProgressColor(metrics.usagePercentage)}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {metrics.usagePercentage.toFixed(1)}% del límite diario
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egress Ayer</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatBytes(metrics.totalBytesYesterday)}
            </div>
            <div className="text-xs text-muted-foreground">
              Dato real de Supabase
            </div>
            <Badge variant="destructive" className="mt-2">
              {((metrics.totalBytesYesterday / metrics.dailyLimit) * 100).toFixed(0)}% sobre límite
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.estimatedDailyCost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              USD hoy ($0.09/GB)
            </div>
            <div className="mt-1 text-xs text-yellow-600">
              Ayer: ${((metrics.totalBytesYesterday / 1000000000) * 0.09).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            <Badge variant={
              metrics.alertLevel === 'critical' ? 'destructive' : 
              metrics.alertLevel === 'warning' ? 'secondary' : 'default'
            }>
              {metrics.alertLevel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.usagePercentage > 100 ? 
                `${(metrics.usagePercentage / 100).toFixed(1)}x` : 
                `${metrics.usagePercentage.toFixed(1)}%`}
            </div>
            <div className="text-xs text-muted-foreground">
              Última actualización: {metrics.lastUpdated.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por fuente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis por Fuente (Tiempo Real)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.sourceBreakdown.length > 0 ? (
            <div className="space-y-3">
              {metrics.sourceBreakdown
                .sort((a, b) => b.bytes - a.bytes)
                .map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{source.source}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.requestCount} requests • Promedio: {formatBytes(source.avgResponseSize)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatBytes(source.bytes)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((source.bytes / metrics.totalBytesToday) * 100).toFixed(1)}% del total
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Interceptando requests... Realiza algunas acciones en la app para ver datos.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis por hora */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Hora (Hoy)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {metrics.hourlyBreakdown.map((hour) => (
              <div key={hour.hour} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {hour.hour.toString().padStart(2, '0')}h
                </div>
                <div 
                  className="bg-blue-500 rounded-sm mx-auto"
                  style={{ 
                    height: `${Math.max(4, (hour.bytes / Math.max(...metrics.hourlyBreakdown.map(h => h.bytes))) * 40)}px`,
                    width: '20px'
                  }}
                  title={`${formatBytes(hour.bytes)} (${hour.requests} requests)`}
                />
                <div className="text-xs mt-1">
                  {hour.requests}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen semanal y mensual */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatBytes(metrics.totalBytesThisWeek)}
            </div>
            <div className="text-sm text-muted-foreground">
              Estimado basado en patrones recientes
            </div>
            <Progress 
              value={(metrics.totalBytesThisWeek / (metrics.dailyLimit * 7)) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proyección Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatBytes(metrics.totalBytesThisMonth)}
            </div>
            <div className="text-sm text-muted-foreground">
              Estimado basado en uso actual
            </div>
            <Progress 
              value={(metrics.totalBytesThisMonth / (metrics.dailyLimit * 30)) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      {metrics.alertLevel !== 'normal' && (
        <Card>
          <CardHeader>
            <CardTitle>🚨 Plan de Acción para Reducir Egress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800">Crítico - Acción Inmediata:</h4>
                <ul className="list-disc list-inside text-red-700 mt-1 space-y-1">
                  <li>Verificar consultas que retornan grandes datasets (tabla Sales, invoices)</li>
                  <li>Implementar paginación estricta en todas las consultas</li>
                  <li>Revisar si hay loops infinitos o consultas repetitivas</li>
                  <li>Activar compresión gzip en todas las respuestas</li>
                </ul>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Optimizaciones Técnicas:</h4>
                <ul className="list-disc list-inside text-yellow-700 mt-1 space-y-1">
                  <li>Usar SELECT específicos en lugar de SELECT *</li>
                  <li>Implementar caché en el frontend para datos estáticos</li>
                  <li>Reducir frecuencia de polling/actualizaciones automáticas</li>
                  <li>Comprimir respuestas JSON del lado del servidor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
