
import { ByteCalculationUtils } from '../byteCalculationUtils';
import type { NetworkRequest } from './types';

export class PerformanceObserverManager {
  private performanceObserver: PerformanceObserver | null = null;
  private onRequestCallback?: (request: NetworkRequest) => void;

  install(onRequest?: (request: NetworkRequest) => void): void {
    this.onRequestCallback = onRequest;

    if (!('PerformanceObserver' in window)) {
      console.warn('⚠️ Performance Observer not available');
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        
        entries.forEach((entry) => {
          if (this.isSupabaseRequest(entry.name)) {
            console.log(`📊 [PERF] Resource: ${entry.name}`);
            
            // Calculate size using performance data
            const sizeResult = ByteCalculationUtils.calculateResponseSize(
              entry.name, 
              undefined, 
              entry
            );
            
            const request: NetworkRequest = {
              url: entry.name,
              method: 'GET', // Performance API doesn't provide method
              size: sizeResult.size,
              responseTime: entry.duration,
              timestamp: new Date(),
              sizeCalculationMethod: sizeResult.method,
              sizeConfidence: sizeResult.confidence
            };

            if (this.onRequestCallback) {
              this.onRequestCallback(request);
            }
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['resource'] });
      console.log('📊 Performance Observer activated');
    } catch (error) {
      console.warn('⚠️ Performance Observer setup failed:', error);
    }
  }

  private isSupabaseRequest(url: string): boolean {
    const supabasePatterns = [
      'supabase.co',
      'dulmmxtkgqkcfovvfxzu',
      '/rest/v1/',
      '/functions/v1/',
      '/auth/v1/',
      '/storage/v1/'
    ];
    
    return supabasePatterns.some(pattern => url.includes(pattern));
  }

  reset(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}
