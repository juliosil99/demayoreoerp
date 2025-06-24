
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
  Bug,
  PlayCircle
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
    getTrackerStats,
    getDiagnostics,
    runDiagnosticTest
  } = useRealEgressMonitor();

  const topEndpoints = getTopEndpoints();
  const trackerStats = getTrackerStats();
  const diagnostics = getDiagnostics();

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header con controles mejorados */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Egress en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Medición precisa del uso de datos con interceptor HTTP activo
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className={`inline-flex items-center gap-1 ${diagnostics.interceptorActive ? 'text-green-600' : 'text-red-600'}`}>
              <Activity className="h-3 w-3" />
              Interceptor: {diagnostics.interceptorActive ? 'Activo' : 'Inactivo'}
            </span>
            <span className={`inline-flex items-center gap-1 ${diagnostics.isActive ? 'text-green-600' : 'text-yellow-600'}`}>
              <Database className="h-3 w-3" />
              Tracker: {diagnostics.isActive ? 'Con datos' : 'Sin datos'}
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600">
              <Clock className="h-3 w-3" />
              {trackerStats.totalRequests} requests capturadas
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
            onClick={runDiagnosticTest}
          >
            <Bug className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button 
            variant="secondary" 
            onClick={resetTracker}
          >
            <Zap className="h-4 w-4 mr-2" />
            Reset
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

      {/* Estado del Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Diagnóstico del Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Estado Interceptor</div>
              <div className={`text-lg font-bold ${diagnostics.interceptorActive ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.interceptorActive ? '✅ Activo' : '❌ Inactivo'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Requests Hoy</div>
              <div className="text-lg font-bold">{diagnostics.todayRequests}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Requests</div>
              <div className="text-lg font-bold">{diagnostics.totalRequests}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Última Request</div>
              <div className="text-lg font-bold">
                {diagnostics.lastRequest ? new Date(diagnostics.lastRequest).toLocaleTimeString() : 'Ninguna'}
              </div>
            </div>
          </div>
          
          {!diagnostics.interceptorActive && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Interceptor Inactivo</AlertTitle>
              <AlertDescription>
                El interceptor HTTP no está funcionando. Haz clic en "Test" para diagnosticar el problema.
              </AlertDescription>
            </Alert>
          )}
          
          {diagnostics.interceptorActive && diagnostics.todayRequests === 0 && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Sin Datos Capturados</AlertTitle>
              <AlertDescription>
                El interceptor está activo pero no ha capturado requests hoy. Navega por la aplicación para generar datos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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

      {/* Métricas principales - SOLO datos reales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egress Medido Hoy</CardTitle>
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
            <CardTitle className="text-sm font-medium">Proyección Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalBytesToday > 0 ? formatBytes(metrics.totalBytesThisWeek) : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.totalBytesToday > 0 ? 'Basado en uso actual' : 'Sin datos suficientes'}
            </div>
            <Badge variant="outline" className="mt-2">
              {metrics.totalBytesToday > 0 ? 'Proyección' : 'Sin datos'}
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
              ${metrics.estimatedDailyCost.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">
              USD hoy ($0.09/GB)
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
            Datos medidos directamente desde las respuestas HTTP interceptadas
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
              <p>
                {diagnostics.interceptorActive 
                  ? 'Interceptando requests... Navega por la aplicación para ver datos.' 
                  : 'Interceptor inactivo. Haz clic en "Test" para activarlo.'}
              </p>
              <p className="text-xs mt-1">El monitor se activa automáticamente al hacer requests a Supabase</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis por tabla/endpoint */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Tabla (Datos Interceptados)</CardTitle>
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

      {/* Estadísticas del Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Monitor</CardTitle>
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

      {/* Guía de uso */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Cómo funciona este monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>✅ Monitor HTTP activo:</strong> Intercepta todas las requests a Supabase y mide el tamaño real de las respuestas</p>
            <p><strong>📊 Datos en tiempo real:</strong> Se actualiza automáticamente cada 30 segundos con datos reales</p>
            <p><strong>🔍 Top Endpoints:</strong> Navega por la app para ver qué páginas consumen más datos</p>
            <p><strong>⚡ Medición precisa:</strong> Mide bytes reales transferidos, no estimaciones</p>
            <p><strong>🚨 Alertas automáticas:</strong> Te avisará si algún endpoint consume más de 10MB</p>
            <p><strong>📈 Análisis por tabla:</strong> Identifica exactamente qué tablas/queries están generando más egress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
