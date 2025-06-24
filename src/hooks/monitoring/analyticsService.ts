
import { supabase } from '@/lib/supabase';

export const fetchSupabaseAnalytics = async () => {
  try {
    console.log('📡 Fetching real Supabase analytics...');
    
    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { 
        metric: 'egress',
        period: '24h'
      }
    });

    if (!error && data) {
      console.log('✅ Real Supabase analytics received:', {
        source: data.source,
        egress_today: data.egress_bytes_today,
        total_egress: data.total_egress,
        breakdown: data.breakdown
      });
      return data;
    } else {
      console.warn('⚠️ Supabase Analytics API returned error:', error);
    }
  } catch (error) {
    console.warn('⚠️ Supabase Analytics not available:', error.message);
  }
  
  console.log('📊 Using local tracking only (no hardcoded estimates)');
  return null;
};
