
import { PersistentEgressTracker } from './PersistentEgressTracker';

interface InterceptorState {
  isInstalled: boolean;
  originalFetch: typeof fetch;
  requestCount: number;
  lastRequestTime: number;
}

class RobustEgressInterceptor {
  private static instance: RobustEgressInterceptor;
  private state: InterceptorState = {
    isInstalled: false,
    originalFetch: window.fetch,
    requestCount: 0,
    lastRequestTime: 0
  };

  static getInstance(): RobustEgressInterceptor {
    if (!RobustEgressInterceptor.instance) {
      RobustEgressInterceptor.instance = new RobustEgressInterceptor();
    }
    return RobustEgressInterceptor.instance;
  }

  install() {
    if (this.state.isInstalled) {
      console.log('🔍 Interceptor already installed');
      return;
    }

    console.log('🚀 Installing robust egress interceptor...');
    
    // Store original fetch
    this.state.originalFetch = window.fetch;
    
    // Override window.fetch
    window.fetch = this.createInterceptedFetch();
    
    this.state.isInstalled = true;
    console.log('✅ Robust egress interceptor installed successfully');
  }

  private createInterceptedFetch() {
    return async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const startTime = performance.now();
      const url = this.extractUrl(args[0]);
      const method = this.extractMethod(args[1]);
      
      // Increment request counter
      this.state.requestCount++;
      this.state.lastRequestTime = Date.now();
      
      console.log(`🌐 [${this.state.requestCount}] ${method} ${url}`);
      
      try {
        const response = await this.state.originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Check if this is a Supabase request with multiple patterns
        if (this.isSupabaseRequest(url)) {
          await this.processSupabaseResponse(url, method, response, responseTime);
        } else {
          console.log(`⏭️ [Skipped] Non-Supabase: ${url}`);
        }
        
        return response;
      } catch (error) {
        console.error('❌ Fetch interceptor error:', error);
        throw error;
      }
    };
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

  private async processSupabaseResponse(
    url: string, 
    method: string, 
    response: Response, 
    responseTime: number
  ) {
    try {
      // Clone response to avoid consuming it
      const clonedResponse = response.clone();
      
      // Get response size
      const responseSize = await this.calculateResponseSize(clonedResponse);
      
      // Track in our system using PersistentEgressTracker
      const tracker = PersistentEgressTracker.getInstance();
      const parsedUrl = new URL(url);
      const endpoint = parsedUrl.pathname + parsedUrl.search;
      
      tracker.trackRequest(endpoint, responseSize, method, responseTime);
      
      console.log(`📊 [CAPTURED] ${method} ${endpoint}:`, {
        size: `${(responseSize / 1024).toFixed(2)}KB`,
        responseTime: `${responseTime.toFixed(0)}ms`,
        status: response.status,
        totalCaptured: tracker.getStats().totalRequests
      });
      
    } catch (error) {
      console.warn('⚠️ Error processing Supabase response:', error);
    }
  }

  private async calculateResponseSize(response: Response): Promise<number> {
    try {
      // Try to get size from Content-Length header first
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }
      
      // Fallback: read response text and calculate size
      const text = await response.text();
      return new TextEncoder().encode(text).length;
    } catch (error) {
      console.warn('Could not calculate response size:', error);
      return 0;
    }
  }

  reset() {
    if (this.state.isInstalled) {
      window.fetch = this.state.originalFetch;
      this.state.isInstalled = false;
      this.state.requestCount = 0;
      this.state.lastRequestTime = 0;
      console.log('🔄 Robust interceptor reset');
    }
  }

  getState(): InterceptorState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.isInstalled;
  }

  async testInterceptor(): Promise<boolean> {
    console.log('🧪 Testing robust interceptor...');
    
    try {
      const testUrl = 'https://dulmmxtkgqkcfovvfxzu.supabase.co/rest/v1/';
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG1teHRrZ3FrY2ZvdnZmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzgzMzQsImV4cCI6MjA1MjYxNDMzNH0.n_8ZA-Z0dUpNXBfZUR4kUQEIP_Kh0rf1x32E8QIAU-8'
        }
      });
      
      console.log('✅ Test request completed, status:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Test request failed:', error);
      return false;
    }
  }
}

export const robustEgressInterceptor = RobustEgressInterceptor.getInstance();
