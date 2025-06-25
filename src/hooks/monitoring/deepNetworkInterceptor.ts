interface NetworkRequest {
  url: string;
  method: string;
  size: number;
  responseTime: number;
  timestamp: Date;
}

interface InterceptorState {
  isActive: boolean;
  requestCount: number;
  lastRequestTime: number;
  capturedRequests: NetworkRequest[];
}

class DeepNetworkInterceptor {
  private static instance: DeepNetworkInterceptor;
  private state: InterceptorState = {
    isActive: false,
    requestCount: 0,
    lastRequestTime: 0,
    capturedRequests: []
  };
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;
  private performanceObserver: PerformanceObserver | null = null;
  private onRequestCallback?: (request: NetworkRequest) => void;

  static getInstance(): DeepNetworkInterceptor {
    if (!DeepNetworkInterceptor.instance) {
      DeepNetworkInterceptor.instance = new DeepNetworkInterceptor();
    }
    return DeepNetworkInterceptor.instance;
  }

  constructor() {
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  install(onRequest?: (request: NetworkRequest) => void) {
    if (this.state.isActive) {
      console.log('🔍 Deep network interceptor already active');
      return;
    }

    console.log('🚀 Installing deep network interceptor...');
    this.onRequestCallback = onRequest;

    // 1. Interceptar fetch
    this.interceptFetch();
    
    // 2. Interceptar XMLHttpRequest
    this.interceptXHR();
    
    // 3. Usar Performance Observer para respaldo
    this.setupPerformanceObserver();

    this.state.isActive = true;
    console.log('✅ Deep network interceptor installed successfully');
  }

  private interceptFetch() {
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const startTime = performance.now();
      const url = this.extractUrl(args[0]);
      const method = this.extractMethod(args[1]);
      
      console.log(`🌐 [FETCH] ${method} ${url}`);
      
      try {
        const response = await this.originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (this.isSupabaseRequest(url)) {
          await this.processResponse(url, method, response, responseTime);
        }
        
        return response;
      } catch (error) {
        console.error('❌ Fetch interceptor error:', error);
        throw error;
      }
    };
  }

  private interceptXHR() {
    const self = this;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const urlString = url.toString();
      console.log(`🌐 [XHR] ${method} ${urlString}`);
      
      // Store request info on the XHR object
      (this as any)._interceptorData = {
        method,
        url: urlString,
        startTime: performance.now()
      };
      
      return self.originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const interceptorData = (this as any)._interceptorData;
      
      if (interceptorData) {
        this.addEventListener('loadend', () => {
          const endTime = performance.now();
          const responseTime = endTime - interceptorData.startTime;
          
          if (self.isSupabaseRequest(interceptorData.url)) {
            const responseSize = this.response ? new TextEncoder().encode(this.response).length : 0;
            self.captureRequest({
              url: interceptorData.url,
              method: interceptorData.method,
              size: responseSize,
              responseTime,
              timestamp: new Date()
            });
          }
        });
      }
      
      return self.originalXHRSend.call(this, body);
    };
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource' && this.isSupabaseRequest(entry.name)) {
              console.log(`📊 [PERF] Resource: ${entry.name}`);
              this.captureRequest({
                url: entry.name,
                method: 'GET', // Performance API doesn't provide method
                size: (entry as any).transferSize || 0,
                responseTime: entry.duration,
                timestamp: new Date()
              });
            }
          });
        });
        
        this.performanceObserver.observe({ entryTypes: ['resource'] });
        console.log('📊 Performance Observer activated');
      } catch (error) {
        console.warn('⚠️ Performance Observer not available:', error);
      }
    }
  }

  private async processResponse(url: string, method: string, response: Response, responseTime: number) {
    try {
      const clonedResponse = response.clone();
      const responseSize = await this.calculateResponseSize(clonedResponse);
      
      this.captureRequest({
        url,
        method,
        size: responseSize,
        responseTime,
        timestamp: new Date()
      });
      
      console.log(`📊 [CAPTURED] ${method} ${url}:`, {
        size: `${(responseSize / 1024).toFixed(2)}KB`,
        responseTime: `${responseTime.toFixed(0)}ms`,
        status: response.status
      });
      
    } catch (error) {
      console.warn('⚠️ Error processing response:', error);
    }
  }

  private async calculateResponseSize(response: Response): Promise<number> {
    try {
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }
      
      const text = await response.text();
      return new TextEncoder().encode(text).length;
    } catch (error) {
      console.warn('Could not calculate response size:', error);
      return 0;
    }
  }

  private captureRequest(request: NetworkRequest) {
    this.state.requestCount++;
    this.state.lastRequestTime = Date.now();
    this.state.capturedRequests.push(request);
    
    // Keep only last 1000 requests to prevent memory issues
    if (this.state.capturedRequests.length > 1000) {
      this.state.capturedRequests = this.state.capturedRequests.slice(-500);
    }
    
    // Call the callback if provided
    if (this.onRequestCallback) {
      this.onRequestCallback(request);
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

  getState(): InterceptorState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  reset() {
    // Restore original functions
    if (this.state.isActive) {
      window.fetch = this.originalFetch;
      XMLHttpRequest.prototype.open = this.originalXHROpen;
      XMLHttpRequest.prototype.send = this.originalXHRSend;
      
      if (this.performanceObserver) {
        this.performanceObserver.disconnect();
        this.performanceObserver = null;
      }
      
      this.state.isActive = false;
      this.state.requestCount = 0;
      this.state.lastRequestTime = 0;
      this.state.capturedRequests = [];
      
      console.log('🔄 Deep network interceptor reset');
    }
  }

  async testInterceptor(): Promise<boolean> {
    console.log('🧪 Testing deep network interceptor...');
    
    try {
      const testUrl = 'https://dulmmxtkgqkcfovvfxzu.supabase.co/rest/v1/';
      const initialCount = this.state.requestCount;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG1teHRrZ3FrY2ZvdnZmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzgzMzQsImV4cCI6MjA1MjYxNDMzNH0.n_8ZA-Z0dUpNXBfZUR4kUQEIP_Kh0rf1x32E8QIAU-8'
        }
      });
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCount = this.state.requestCount;
      const success = newCount > initialCount;
      
      console.log(`✅ Test completed - Requests captured: ${newCount - initialCount}`, {
        status: response.status,
        initialCount,
        newCount,
        success
      });
      
      return success;
    } catch (error) {
      console.error('❌ Test request failed:', error);
      return false;
    }
  }
}

export const deepNetworkInterceptor = DeepNetworkInterceptor.getInstance();
