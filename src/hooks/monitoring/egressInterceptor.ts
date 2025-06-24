
import { PreciseEgressTracker } from './EgressTracker';

const originalFetch = window.fetch;
let isInterceptorInstalled = false;

export const installEgressInterceptor = () => {
  if (isInterceptorInstalled) {
    console.log('🔍 Egress interceptor already installed');
    return;
  }
  
  window.fetch = async (...args) => {
    const startTime = performance.now();
    const url = args[0]?.toString() || '';
    const method = args[1]?.method || 'GET';
    
    // Log todas las requests para debugging
    console.log(`🌐 [Interceptor] ${method} ${url}`);
    
    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Detectar requests a Supabase con múltiples patrones
      const isSupabaseRequest = url.includes('supabase.co') || 
                               url.includes('dulmmxtkgqkcfovvfxzu') ||
                               url.includes('/rest/v1/') ||
                               url.includes('/functions/v1/');
      
      if (isSupabaseRequest) {
        const clonedResponse = response.clone();
        
        try {
          const text = await clonedResponse.text();
          const size = new TextEncoder().encode(text).length;
          
          const tracker = PreciseEgressTracker.getInstance();
          const parsedUrl = new URL(url);
          const endpoint = parsedUrl.pathname + parsedUrl.search;
          
          tracker.trackRequest(endpoint, size, method, responseTime);
          
          // Log todas las requests capturadas para debugging
          console.log(`📊 [Egress Captured] ${method} ${endpoint}:`, {
            size: `${(size / 1024).toFixed(2)}KB`,
            responseTime: `${responseTime.toFixed(0)}ms`,
            status: response.status,
            totalTracked: tracker.getStats().totalRequests
          });
          
        } catch (error) {
          console.warn('Error measuring response size:', error);
        }
      } else {
        console.log(`⏭️ [Skipped] Non-Supabase request: ${url}`);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch interceptor error:', error);
      throw error;
    }
  };
  
  isInterceptorInstalled = true;
  console.log('🔍 Enhanced egress interceptor installed successfully');
};

export const resetInterceptor = () => {
  if (isInterceptorInstalled) {
    window.fetch = originalFetch;
    isInterceptorInstalled = false;
    console.log('🔄 Egress interceptor reset');
  }
};

export const isInterceptorActive = () => isInterceptorInstalled;

export const testInterceptor = async () => {
  console.log('🧪 Testing egress interceptor...');
  
  try {
    // Hacer una request de prueba a Supabase
    const testUrl = 'https://dulmmxtkgqkcfovvfxzu.supabase.co/rest/v1/';
    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG1teHRrZ3FrY2ZvdnZmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzgzMzQsImV4cCI6MjA1MjYxNDMzNH0.n_8ZA-Z0dUpNXBfZUR4kUQEIP_Kh0rf1x32E8QIAU-8'
      }
    });
    
    console.log('✅ Test request completed, response status:', response.status);
    
    const tracker = PreciseEgressTracker.getInstance();
    const stats = tracker.getStats();
    console.log('📈 Current tracker stats:', stats);
    
    return true;
  } catch (error) {
    console.error('❌ Test request failed:', error);
    return false;
  }
};
