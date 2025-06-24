
export interface EgressSource {
  source: string;
  bytes: number;
  requestCount: number;
  avgResponseSize: number;
  timestamp: Date;
}

export interface RealEgressMetrics {
  totalBytesToday: number;
  totalBytesThisWeek: number;
  totalBytesThisMonth: number;
  sourceBreakdown: EgressSource[];
  hourlyBreakdown: Array<{
    hour: number;
    bytes: number;
    requests: number;
  }>;
  alertLevel: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
  estimatedDailyCost: number;
  dailyLimit: number;
  usagePercentage: number;
  realSupabaseData?: {
    totalEgress: number;
    timestamp: Date;
  };
}

export interface EgressAlert {
  id: string;
  level: 'warning' | 'critical';
  message: string;
  bytes: number;
  source?: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface RequestLog {
  endpoint: string;
  size: number;
  timestamp: Date;
  method: string;
  responseTime: number;
  table: string;
}

export interface TrackerStats {
  totalRequests: number;
  totalBytes: number;
  uptimeHours: number;
  avgBytesPerHour: number;
  avgRequestSize: number;
}
