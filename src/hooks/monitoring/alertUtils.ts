
import type { RealEgressMetrics, EgressAlert, TrackerStats } from './types';
import { toast } from 'sonner';

export const checkAndGenerateAlerts = (
  currentMetrics: RealEgressMetrics, 
  stats: TrackerStats
): EgressAlert[] => {
  const newAlerts: EgressAlert[] = [];

  // Alerta crítica para uso excesivo
  if (currentMetrics.usagePercentage > 150) {
    const criticalAlert: EgressAlert = {
      id: `critical-${Date.now()}`,
      level: 'critical',
      message: `CRÍTICO: Egress de ${(currentMetrics.totalBytesToday / 1000000).toFixed(2)}MB supera límite de ${(currentMetrics.dailyLimit / 1000000).toFixed(0)}MB por ${(currentMetrics.usagePercentage / 100).toFixed(1)}x`,
      bytes: currentMetrics.totalBytesToday,
      timestamp: new Date(),
      acknowledged: false
    };
    newAlerts.push(criticalAlert);
    
    toast.error(criticalAlert.message, {
      duration: 15000,
      action: {
        label: 'Ver Detalles',
        onClick: () => {}
      }
    });
  }

  // Alertas por fuente específica
  currentMetrics.sourceBreakdown.forEach(source => {
    if (source.bytes > 10000000) { // > 10MB de una sola fuente
      const sourceAlert: EgressAlert = {
        id: `source-${source.source}-${Date.now()}`,
        level: 'warning',
        message: `Endpoint "${source.source}" consume ${(source.bytes / 1000000).toFixed(2)}MB con ${source.requestCount} requests (promedio: ${(source.avgResponseSize / 1024).toFixed(2)}KB por request)`,
        bytes: source.bytes,
        source: source.source,
        timestamp: new Date(),
        acknowledged: false
      };
      newAlerts.push(sourceAlert);
    }
  });

  return newAlerts;
};
