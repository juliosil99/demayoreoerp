
import type { EgressAlert } from '../types';

export class AlertsManager {
  static acknowledgeAlert(alerts: EgressAlert[], alertId: string): EgressAlert[] {
    return alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    );
  }

  static clearAcknowledgedAlerts(alerts: EgressAlert[]): EgressAlert[] {
    return alerts.filter(alert => !alert.acknowledged);
  }
}
