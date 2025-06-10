
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Activity, RefreshCw, CheckCircle } from 'lucide-react';
import { useEgressMonitor } from '@/hooks/useEgressMonitor';
import { formatBytes } from '@/utils/formatters';

export function EgressDashboard() {
  const { 
    metrics, 
    alerts, 
    isLoading, 
    acknowledgeAlert, 
    clearAcknowledgedAlerts, 
    refreshMetrics 
  } = useEgressMonitor();

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Egress</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del uso de datos de Supabase
          </p>
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
          {unacknowledgedAlerts.length > 0 && (
            <Button 
              variant="secondary" 
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
            <CardTitle className="text-sm font-medium">Uso Diario Actual</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.currentUsage)}
            </div>
            <div className="text-xs text-muted-foreground">
              de {formatBytes(metrics.dailyLimit)} límite diario
            </div>
            <Progress 
              value={metrics.usagePercentage} 
              className="mt-2"
              color={getProgressColor(metrics.usagePercentage)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porcentaje de Uso</CardTitle>
            <Badge variant={
              metrics.alertLevel === 'critical' ? 'destructive' : 
              metrics.alertLevel === 'warning' ? 'secondary' : 'default'
            }>
              {metrics.alertLevel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.usagePercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              del límite diario
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimación Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.estimatedMonthlyUsage)}
            </div>
            <div className="text-xs text-muted-foreground">
              de {formatBytes(metrics.monthlyLimit)} límite mensual
            </div>
            <Progress 
              value={(metrics.estimatedMonthlyUsage / metrics.monthlyLimit) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.lastUpdated.toLocaleTimeString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.lastUpdated.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico diario */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Uso (Últimos 7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.dailyHistory.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{day.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {formatBytes(day.usage)}
                  </span>
                  <Progress 
                    value={(day.usage / metrics.dailyLimit) * 100} 
                    className="w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
