
import { ByteCalculationUtils } from '../byteCalculationUtils';
import type { NetworkRequest, PendingRequest } from './types';

export class FetchInterceptor {
  private originalFetch: typeof fetch;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private onRequestCallback?: (request: NetworkRequest) => void;

  constructor() {
    this.originalFetch = window.fetch;
  }

  install(onRequest?: (request: NetworkRequest) => void): void {
    this.onRequestCallback = onRequest;
    const self = this;
    
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const startTime = performance.now();
      const url = self.extractUrl(args[0]);
      const method = self.extractMethod(args[1]);
      const requestId = `${url}-${startTime}`;
      
      // Store request info for performance observer correlation
      self.pendingRequests.set(requestId, { startTime, url, method });
      
      console.log(`🌐 [FETCH] ${method} ${url}`);
      
      try {
        const response = await self.originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (self.isSupabaseRequest(url)) {
          await self.processSupabaseResponse(url, method, response, responseTime, requestId);
        }
        
        // Clean up pending request
        self.pendingRequests.delete(requestId);
        
        return response;
      } catch (error) {
        console.error('❌ Fetch interceptor error:', error);
        self.pendingRequests.delete(requestId);
        throw error;
      }
    };
  }

  private async processSupabaseResponse(
    url: string, 
    method: string, 
    response: Response, 
    responseTime: number,
    requestId: string
  ): Promise<void> {
    try {
      // Don't clone the response - calculate size from headers and estimation
      const sizeResult = ByteCalculationUtils.calculateResponseSize(url, response);
      
      const request: NetworkRequest = {
        url,
        method,
        size: sizeResult.size,
        responseTime,
        timestamp: new Date(),
        sizeCalculationMethod: sizeResult.method,
        sizeConfidence: sizeResult.confidence
      };

      if (this.onRequestCallback) {
        this.onRequestCallback(request);
      }
      
      console.log(`📊 [CAPTURED] ${method} ${url}:`, {
        size: `${(sizeResult.size / 1024).toFixed(2)}KB`,
        responseTime: `${responseTime.toFixed(0)}ms`,
        status: response.status,
        method: sizeResult.method,
        confidence: sizeResult.confidence,
        details: sizeResult.details
      });
      
    } catch (error) {
      console.warn('⚠️ Error processing response:', error);
      
      // Fallback: use estimation only
      const fallbackSize = ByteCalculationUtils.calculateResponseSize(url);
      const request: NetworkRequest = {
        url,
        method,
        size: fallbackSize.size,
        responseTime,
        timestamp: new Date(),
        sizeCalculationMethod: 'estimation',
        sizeConfidence: 'low'
      };

      if (this.onRequestCallback) {
        this.onRequestCallback(request);
      }
    }
  }

  private extractUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    if (input instanceof Request) return input.url;
    return String(input);
  }

  private extractMethod(init?: RequestInit): string {
    return init?.method || 'GET';
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
    window.fetch = this.originalFetch;
    this.pendingRequests.clear();
  }
}
