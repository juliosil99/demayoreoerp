
import { PreciseEgressTracker } from './EgressTracker';

const originalFetch = window.fetch;
let isInterceptorInstalled = false;

export const installEgressInterceptor = () => {
  if (isInterceptorInstalled) return;
  
  window.fetch = async (...args) => {
    const startTime = performance.now();
    const url = args[0]?.toString() || '';
    const method = args[1]?.method || 'GET';
    
    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Solo rastrear llamadas a Supabase
      if (url.includes('supabase.co') || url.includes('dulmmxtkgqkcfovvfxzu')) {
        const clonedResponse = response.clone();
        
        try {
          const text = await clonedResponse.text();
          const size = new TextEncoder().encode(text).length;
          
          const tracker = PreciseEgressTracker.getInstance();
          const parsedUrl = new URL(url);
          const endpoint = parsedUrl.pathname + parsedUrl.search;
          
          tracker.trackRequest(endpoint, size, method, responseTime);
          
          // Log para requests significativos
          if (size > 50000 || responseTime > 1000) {
            console.log(`📊 [Egress Monitor] ${method} ${endpoint}:`, {
              size: `${(size / 1024).toFixed(2)}KB`,
              responseTime: `${responseTime.toFixed(0)}ms`,
              status: response.status
            });
          }
        } catch (error) {
          console.warn('Error measuring response size:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch interceptor error:', error);
      throw error;
    }
  };
  
  isInterceptorInstalled = true;
  console.log('🔍 Enhanced egress interceptor installed');
};
