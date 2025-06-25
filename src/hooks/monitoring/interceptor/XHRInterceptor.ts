
import { ByteCalculationUtils } from '../byteCalculationUtils';
import type { NetworkRequest } from './types';

export class XHRInterceptor {
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;
  private onRequestCallback?: (request: NetworkRequest) => void;

  constructor() {
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  install(onRequest?: (request: NetworkRequest) => void): void {
    this.onRequestCallback = onRequest;
    const self = this;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const urlString = url.toString();
      console.log(`🌐 [XHR] ${method} ${urlString}`);
      
      (this as any)._interceptorData = {
        method,
        url: urlString,
        startTime: performance.now()
      };
      
      return self.originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const interceptorData = (this as any)._interceptorData;
      
      if (interceptorData && self.isSupabaseRequest(interceptorData.url)) {
        this.addEventListener('loadend', () => {
          const endTime = performance.now();
          const responseTime = endTime - interceptorData.startTime;
          
          // Calculate size using intelligent estimation
          const sizeResult = ByteCalculationUtils.calculateResponseSize(interceptorData.url);
          
          const request: NetworkRequest = {
            url: interceptorData.url,
            method: interceptorData.method,
            size: sizeResult.size,
            responseTime,
            timestamp: new Date(),
            sizeCalculationMethod: sizeResult.method,
            sizeConfidence: sizeResult.confidence
          };

          if (self.onRequestCallback) {
            self.onRequestCallback(request);
          }
        });
      }
      
      return self.originalXHRSend.call(this, body);
    };
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
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;
  }
}
