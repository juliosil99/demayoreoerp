import { ByteCalculationUtils } from './byteCalculationUtils';

interface NetworkRequest {
  url: string;
  method: string;
  size: number;
  responseTime: number;
  timestamp: Date;
  sizeCalculationMethod?: string;
  sizeConfidence?: string;
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
  private pendingRequests: Map<string, {startTime: number, url: string, method: string}> = new Map();

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

    console.log('🚀 Installing deep network interceptor with enhanced byte calculation...');
    this.onRequestCallback = onRequest;

    this.interceptFetch();
    this.interceptXHR();
    this.setupPerformanceObserver();

    this.state.isActive = true;
    console.log('✅ Deep network interceptor installed successfully');
  }

  private interceptFetch() {
    const self = this;
    
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const startTime = performance.now();
      const url = this.extractUrl(args[0]);
      const method = this.extractMethod(args[1]);
      const requestId = `${url}-${startTime}`;
      
      // Store request info for performance observer correlation
      this.pendingRequests.set(requestId, { startTime, url, method });
      
      console.log(`🌐 [FETCH] ${method} ${url}`);
      
      try {
        const response = await self.originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (this.isSupabaseRequest(url)) {
          await this.processSupabaseResponse(url, method, response, responseTime, requestId);
        }
        
        // Clean up pending request
        this.pendingRequests.delete(requestId);
        
        return response;
      } catch (error) {
        console.error('❌ Fetch interceptor error:', error);
        this.pendingRequests.delete(requestId);
        throw error;
      }
    };
  }

  private interceptXHR() {
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
          
          self.captureRequest({
            url: interceptorData.url,
            method: interceptorData.method,
            size: sizeResult.size,
            responseTime,
            timestamp: new Date(),
            sizeCalculationMethod: sizeResult.method,
            sizeConfidence: sizeResult.confidence
          });
        });
      }
      
      return self.originalXHRSend.call(this, body);
    };
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
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
              
              this.captureRequest({
                url: entry.name,
                method: 'GET', // Performance API doesn't provide method
                size: sizeResult.size,
                responseTime: entry.duration,
                timestamp: new Date(),
                sizeCalculationMethod: sizeResult.method,
                sizeConfidence: sizeResult.confidence
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

  private async processSupabaseResponse(
    url: string, 
    method: string, 
    response: Response, 
    responseTime: number,
    requestId: string
  ) {
    try {
      // Don't clone the response - calculate size from headers and estimation
      const sizeResult = ByteCalculationUtils.calculateResponseSize(url, response);
      
      this.captureRequest({
        url,
        method,
        size: sizeResult.size,
        responseTime,
        timestamp: new Date(),
        sizeCalculationMethod: sizeResult.method,
        sizeConfidence: sizeResult.confidence
      });
      
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
      this.captureRequest({
        url,
        method,
        size: fallbackSize.size,
        responseTime,
        timestamp: new Date(),
        sizeCalculationMethod: 'estimation',
        sizeConfidence: 'low'
      });
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
      this.pendingRequests.clear();
      
      console.log('🔄 Deep network interceptor reset');
    }
  }

  async testInterceptor(): Promise<boolean> {
    console.log('🧪 Testing deep network interceptor with enhanced byte calculation...');
    
    try {
      const testUrl = 'https://dulmmxtkgqkcfovvfxzu.supabase.co/rest/v1/';
      const initialCount = this.state.requestCount;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG1teHRrZ3FrY2ZvdnZmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzgzMzQsImV4cCI6MjA1MjYxNDMzNH0.n_8ZA-Z0dUpNXBfZUR4kUQEIP_Kh0rf1x32E8QIAU-8'
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCount = this.state.requestCount;
      const success = newCount > initialCount;
      
      console.log(`✅ Enhanced test completed - Requests captured: ${newCount - initialCount}`, {
        status: response.status,
        initialCount,
        newCount,
        success,
        lastCapturedRequest: this.state.capturedRequests[this.state.capturedRequests.length - 1]
      });
      
      return success;
    } catch (error) {
      console.error('❌ Test request failed:', error);
      return false;
    }
  }
}

export const deepNetworkInterceptor = DeepNetworkInterceptor.getInstance();
