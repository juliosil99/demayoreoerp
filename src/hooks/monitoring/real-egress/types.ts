
import type { RealEgressMetrics, EgressAlert } from '../types';

export interface EgressMonitorState {
  metrics: RealEgressMetrics;
  alerts: EgressAlert[];
  isLoading: boolean;
}

export interface EgressMonitorActions {
  acknowledgeAlert: (alertId: string) => void;
  clearAcknowledgedAlerts: () => void;
  refreshMetrics: () => Promise<void>;
  forceRefresh: () => void;
  resetTracker: () => void;
  getTopEndpoints: () => any[];
  getTrackerStats: () => any;
  getDiagnostics: () => any;
  runDiagnosticTest: () => Promise<boolean>;
}

export interface EgressMonitorHookReturn extends EgressMonitorState, EgressMonitorActions {}
