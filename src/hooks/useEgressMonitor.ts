
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EgressMetrics {
  currentUsage: number;
  dailyLimit: number;
  monthlyLimit: number;
  usagePercentage: number;
  estimatedMonthlyUsage: number;
  alertLevel: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
  dailyHistory: Array<{
    date: string;
    usage: number;
  }>;
}

interface EgressAlert {
  id: string;
  level: 'warning' | 'critical';
  message: string;
  threshold: number;
  currentUsage: number;
  timestamp: Date;
  acknowledged: boolean;
}

export const useEgressMonitor = () => {
  const [metrics, setMetrics] = useState<EgressMetrics>({
    currentUsage: 0,
    dailyLimit: 5000000, // 5GB daily limit (ejemplo)
    monthlyLimit: 150000000, // 150GB monthly limit
    usagePercentage: 0,
    estimatedMonthlyUsage: 0,
    alertLevel: 'normal',
    lastUpdated: new Date(),
    dailyHistory: []
  });
  
  const [alerts, setAlerts] = useState<EgressAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular métricas de Egress basadas en queries reales
  const calculateEgressUsage = async () => {
    try {
      // Obtener métricas básicas del sistema
      const { data: salesCount } = await supabase
        .from('Sales')
        .select('id', { count: 'exact', head: true });
      
      const { data: paymentsCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true });
      
      const { data: expensesCount } = await supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true });

      // Estimar Egress basado en volumen de datos
      const estimatedEgressPerRecord = 2000; // bytes promedio por registro
      const totalRecords = (salesCount?.length || 0) + (paymentsCount?.length || 0) + (expensesCount?.length || 0);
      const estimatedDailyUsage = totalRecords * estimatedEgressPerRecord * 0.1; // 10% de consultas diarias

      return estimatedDailyUsage;
    } catch (error) {
      console.error('Error calculating egress usage:', error);
      return 0;
    }
  };

  const fetchEgressMetrics = async () => {
    try {
      setIsLoading(true);
      
      const currentUsage = await calculateEgressUsage();
      const usagePercentage = (currentUsage / metrics.dailyLimit) * 100;
      const estimatedMonthlyUsage = currentUsage * 30;
      
      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      if (usagePercentage > 90) alertLevel = 'critical';
      else if (usagePercentage > 70) alertLevel = 'warning';

      const newMetrics: EgressMetrics = {
        currentUsage,
        dailyLimit: metrics.dailyLimit,
        monthlyLimit: metrics.monthlyLimit,
        usagePercentage,
        estimatedMonthlyUsage,
        alertLevel,
        lastUpdated: new Date(),
        dailyHistory: [
          ...metrics.dailyHistory.slice(-6), // Keep last 7 days
          {
            date: new Date().toISOString().split('T')[0],
            usage: currentUsage
          }
        ]
      };

      setMetrics(newMetrics);
      
      // Generar alertas si es necesario
      checkAndGenerateAlerts(newMetrics);
      
    } catch (error) {
      console.error('Error fetching egress metrics:', error);
      toast.error('Error al obtener métricas de Egress');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndGenerateAlerts = (currentMetrics: EgressMetrics) => {
    const newAlerts: EgressAlert[] = [];

    // Alerta crítica > 90%
    if (currentMetrics.usagePercentage > 90) {
      const criticalAlert: EgressAlert = {
        id: `critical-${Date.now()}`,
        level: 'critical',
        message: `Uso crítico de Egress: ${currentMetrics.usagePercentage.toFixed(1)}% del límite diario`,
        threshold: 90,
        currentUsage: currentMetrics.currentUsage,
        timestamp: new Date(),
        acknowledged: false
      };
      newAlerts.push(criticalAlert);
      
      toast.error(criticalAlert.message, {
        duration: 10000,
        action: {
          label: 'Ver Dashboard',
          onClick: () => acknowledgeAlert(criticalAlert.id)
        }
      });
    }
    
    // Alerta warning > 70%
    else if (currentMetrics.usagePercentage > 70) {
      const warningAlert: EgressAlert = {
        id: `warning-${Date.now()}`,
        level: 'warning',
        message: `Uso elevado de Egress: ${currentMetrics.usagePercentage.toFixed(1)}% del límite diario`,
        threshold: 70,
        currentUsage: currentMetrics.currentUsage,
        timestamp: new Date(),
        acknowledged: false
      };
      newAlerts.push(warningAlert);
      
      toast.warning(warningAlert.message, {
        duration: 5000
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const clearAcknowledgedAlerts = () => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged));
  };

  // Monitoreo automático cada 5 minutos
  useEffect(() => {
    fetchEgressMetrics();
    
    const interval = setInterval(fetchEgressMetrics, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    alerts,
    isLoading,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    refreshMetrics: fetchEgressMetrics
  };
};
