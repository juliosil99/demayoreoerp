
import { supabase } from '@/lib/supabase';

export const fetchSupabaseAnalytics = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { 
        metric: 'egress',
        period: '24h'
      }
    });

    if (!error && data) {
      console.log('📈 Real Supabase analytics data:', data);
      return data;
    }
  } catch (error) {
    console.log('📊 Supabase Analytics not available, using local tracking only');
  }
  return null;
};
