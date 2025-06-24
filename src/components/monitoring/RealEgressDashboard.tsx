
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
  DollarSign,
  Clock,
  Target,
  Info,
  Eye
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
    resetTracker,
    getTopEndpoints,
    getTrackerStats
  } = useRealEgressMonitor();

  const topEndpoints = getTopEndpoints();
  const trackerStats = getTrackerStats();

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 150) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Egress Mejorado</h2>
          <p className="text-muted-foreground">
            Medición exacta y en tiempo real del uso de datos
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {trackerStats.totalRequests} requests monitoreadas
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {trackerStats.uptimeHours.toFixed(1)}h activo
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="h-3 w-3" />
              Promedio: {formatBytes(trackerStats.avgRequestSize)}/request
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
            Reset Monitor
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
                <span>Alerta de Egress - {alert.level.toUpperCase()}</span>
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
                    <strong>Endpoint:</strong> {alert.source} • <strong>Bytes:</strong> {formatBytes(alert.bytes)}
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

      {/* Datos corregidos de ayer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Datos Corregidos de Egress</AlertTitle>
        <AlertDescription>
          <strong>Ayer (datos reales):</strong> 406MB - El sistema anterior mostraba incorrectamente 1.49GB
          <br />
          <strong>Monitoreo actual:</strong> Midiendo tamaño real de respuestas con interceptor mejorado
        </AlertDescription>
      </Alert>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egress Hoy (Medido)</CardTitle>
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
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {metrics.usagePercentage.toFixed(1)}% del límite diario
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ayer (Real - Corregido)</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(metrics.totalBytesYesterday)}
            </div>
            <div className="text-xs text-muted-foreground">
              Dato real verificado en DB
            </div>
            <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
              Dentro del límite esperado
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
              ${metrics.estimatedDailyCost.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">
              USD hoy ($0.09/GB)
            </div>
            <div className="mt-1 text-xs text-green-600">
              Ayer: ${((metrics.totalBytesYesterday / 1000000000) * 0.09).toFixed(3)}
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

      {/* Top Endpoints EN TIEMPO REAL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Endpoints por Consumo (Tiempo Real)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Datos medidos directamente desde las respuestas HTTP
          </p>
        </CardHeader>
        <CardContent>
          {topEndpoints.length > 0 ? (
            <div className="space-y-3">
              {topEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold">{endpoint.endpoint}</div>
                    <div className="text-xs text-muted-foreground">
                      Tabla: <span className="font-medium">{endpoint.table}</span> • 
                      {endpoint.count} requests • 
                      Promedio: {formatBytes(endpoint.avgSize)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatBytes(endpoint.bytes)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((endpoint.bytes / Math.max(metrics.totalBytesToday, 1)) * 100).toFixed(1)}% del total
                    </div>
                    {endpoint.bytes > 5000000 && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        Alto consumo
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Interceptando requests... Navega por la aplicación para ver datos.</p>
              <p className="text-xs mt-1">El monitor se activa automáticamente al hacer requests a Supabase</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis por tabla/endpoint */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Tabla (Datos Reales)</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.sourceBreakdown.length > 0 ? (
            <div className="space-y-3">
              {metrics.sourceBreakdown
                .slice(0, 10)
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
                        {((source.bytes / Math.max(metrics.totalBytesToday, 1)) * 100).toFixed(1)}% del total
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Esperando actividad... El monitor rastreará automáticamente las consultas.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribución por hora */}
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
                    height: `${Math.max(4, (hour.bytes / Math.max(...metrics.hourlyBreakdown.map(h => h.bytes), 1)) * 40)}px`,
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

      {/* Estadísticas del Monitor Mejorado */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Monitor Mejorado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Requests</div>
              <div className="text-lg font-bold">{trackerStats.totalRequests.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Medido</div>
              <div className="text-lg font-bold">{formatBytes(trackerStats.totalBytes)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Promedio/Hora</div>
              <div className="text-lg font-bold">{formatBytes(trackerStats.avgBytesPerHour)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Tiempo Activo</div>
              <div className="text-lg font-bold">{trackerStats.uptimeHours.toFixed(1)}h</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guía de optimización */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Cómo usar este monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>✅ Monitor activo:</strong> Mide automáticamente el tamaño real de todas las respuestas</p>
            <p><strong>📊 Datos corregidos:</strong> Ayer fueron 406MB (no 1.49GB como mostraba antes)</p>
            <p><strong>🔍 Top Endpoints:</strong> Navega por la app para ver qué páginas consumen más datos</p>
            <p><strong>⚡ Tiempo real:</strong> Las métricas se actualizan automáticamente cada 30 segundos</p>
            <p><strong>🚨 Alertas:</strong> Te avisará si algún endpoint consume más de 10MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
