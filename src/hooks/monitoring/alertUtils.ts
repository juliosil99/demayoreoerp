
import type { RealEgressMetrics, EgressAlert, TrackerStats } from './types';

export const checkAndGenerateAlerts = (
  metrics: RealEgressMetrics,
  stats: TrackerStats
): EgressAlert[] => {
  const alerts: EgressAlert[] = [];

  // Critical alert for high usage
  if (metrics.usagePercentage > 150) {
    alerts.push({
      id: `critical-${Date.now()}`,
      level: 'critical',
      message: `Uso crítico de Egress: ${(metrics.totalBytesToday / 1000000).toFixed(2)}MB supera el límite diario en ${(metrics.usagePercentage - 100).toFixed(1)}%`,
      bytes: metrics.totalBytesToday,
      timestamp: new Date(),
      acknowledged: false
    });
  }
  
  // Warning alert for elevated usage
  else if (metrics.usagePercentage > 80) {
    alerts.push({
      id: `warning-${Date.now()}`,
      level: 'warning',
      message: `Uso elevado de Egress: ${(metrics.totalBytesToday / 1000000).toFixed(2)}MB representa ${metrics.usagePercentage.toFixed(1)}% del límite diario`,
      bytes: metrics.totalBytesToday,
      timestamp: new Date(),
      acknowledged: false
    });
  }

  return alerts;
};
