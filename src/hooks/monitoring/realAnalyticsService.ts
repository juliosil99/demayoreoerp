
import { supabase } from '@/lib/supabase';

interface RealAnalyticsData {
  source: 'supabase_api' | 'local_tracker' | 'unavailable';
  egress_bytes_today: number;
  total_egress: number;
  isEstimate: boolean;
  breakdown?: {
    invoices: { count: number; estimated_bytes: number };
    sales: { count: number; estimated_bytes: number };
    expenses: { count: number; estimated_bytes: number };
  };
  timestamp: Date;
  note?: string;
}

export const fetchRealSupabaseAnalytics = async (): Promise<RealAnalyticsData | null> => {
  try {
    console.log('📡 Attempting to fetch real Supabase analytics...');
    
    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { 
        metric: 'egress',
        period: '24h'
      }
    });

    if (!error && data && !data.error) {
      console.log('✅ Real Supabase analytics received:', {
        source: data.source,
        egress_today: data.egress_bytes_today,
        total_egress: data.total_egress,
        isEstimate: data.isEstimate || false
      });
      
      return {
        source: 'supabase_api',
        egress_bytes_today: data.egress_bytes_today || 0,
        total_egress: data.total_egress || 0,
        isEstimate: data.isEstimate || false,
        breakdown: data.breakdown,
        timestamp: new Date(),
        note: data.note
      };
    } else {
      console.warn('⚠️ Supabase Analytics API returned error:', error || data?.error);
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Supabase Analytics not available:', error.message);
    return null;
  }
};

export const getLocalTrackerData = (tracker: any): RealAnalyticsData => {
  const todayBytes = tracker.getTodayBytes();
  const stats = tracker.getStats();
  
  console.log('📊 Using local tracker data:', {
    todayBytes,
    totalRequests: stats.totalRequests,
    source: 'local_tracker'
  });
  
  return {
    source: 'local_tracker',
    egress_bytes_today: todayBytes,
    total_egress: stats.totalBytes,
    isEstimate: false, // This is real measured data
    timestamp: new Date(),
    note: 'Datos medidos en tiempo real por el interceptor HTTP'
  };
};

export const getFallbackData = (): RealAnalyticsData => {
  console.log('⚠️ Using fallback - no real data available');
  
  return {
    source: 'unavailable',
    egress_bytes_today: 0,
    total_egress: 0,
    isEstimate: false,
    timestamp: new Date(),
    note: 'No hay datos disponibles. El monitor HTTP no ha capturado ninguna request aún.'
  };
};

export const combineAnalyticsData = (
  supabaseData: RealAnalyticsData | null,
  localData: RealAnalyticsData
): RealAnalyticsData => {
  // Prioritize local tracker data if it has more recent/accurate data
  if (localData.egress_bytes_today > 0) {
    console.log('📊 Using local tracker as primary data source');
    return {
      ...localData,
      // Use Supabase total if available and larger
      total_egress: supabaseData?.total_egress && supabaseData.total_egress > localData.total_egress 
        ? supabaseData.total_egress 
        : localData.total_egress,
      note: 'Datos primarios del tracker local HTTP + totales de Supabase'
    };
  }
  
  // Fall back to Supabase data if local tracker is empty
  if (supabaseData) {
    console.log('📊 Using Supabase analytics as primary data source');
    return {
      ...supabaseData,
      note: 'Datos de Supabase Analytics (tracker local sin datos)'
    };
  }
  
  // Last resort: no data available
  return getFallbackData();
};
