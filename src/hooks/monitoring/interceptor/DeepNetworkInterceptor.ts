
import type { NetworkRequest, InterceptorState } from './types';
import { StateManager } from './StateManager';
import { FetchInterceptor } from './FetchInterceptor';
import { XHRInterceptor } from './XHRInterceptor';
import { PerformanceObserverManager } from './PerformanceObserver';

class DeepNetworkInterceptor {
  private static instance: DeepNetworkInterceptor;
  private stateManager: StateManager;
  private fetchInterceptor: FetchInterceptor;
  private xhrInterceptor: XHRInterceptor;
  private performanceObserver: PerformanceObserverManager;

  static getInstance(): DeepNetworkInterceptor {
    if (!DeepNetworkInterceptor.instance) {
      DeepNetworkInterceptor.instance = new DeepNetworkInterceptor();
    }
    return DeepNetworkInterceptor.instance;
  }

  constructor() {
    this.stateManager = new StateManager();
    this.fetchInterceptor = new FetchInterceptor();
    this.xhrInterceptor = new XHRInterceptor();
    this.performanceObserver = new PerformanceObserverManager();
  }

  install(onRequest?: (request: NetworkRequest) => void): void {
    if (this.stateManager.isActive()) {
      console.log('🔍 Deep network interceptor already active');
      return;
    }

    console.log('🚀 Installing deep network interceptor with enhanced byte calculation...');
    
    const requestHandler = (request: NetworkRequest) => {
      this.stateManager.captureRequest(request);
      if (onRequest) {
        onRequest(request);
      }
    };

    this.fetchInterceptor.install(requestHandler);
    this.xhrInterceptor.install(requestHandler);
    this.performanceObserver.install(requestHandler);

    this.stateManager.setActive(true);
    console.log('✅ Deep network interceptor installed successfully');
  }

  getState(): InterceptorState {
    return this.stateManager.getState();
  }

  isActive(): boolean {
    return this.stateManager.isActive();
  }

  reset(): void {
    if (this.stateManager.isActive()) {
      this.fetchInterceptor.reset();
      this.xhrInterceptor.reset();
      this.performanceObserver.reset();
      this.stateManager.reset();
      
      console.log('🔄 Deep network interceptor reset');
    }
  }

  async testInterceptor(): Promise<boolean> {
    console.log('🧪 Testing deep network interceptor with enhanced byte calculation...');
    
    try {
      const testUrl = 'https://dulmmxtkgqkcfovvfxzu.supabase.co/rest/v1/';
      const initialCount = this.stateManager.getState().requestCount;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG1teHRrZ3FrY2ZvdnZmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzgzMzQsImV4cCI6MjA1MjYxNDMzNH0.n_8ZA-Z0dUpNXBfZUR4kUQEIP_Kh0rf1x32E8QIAU-8'
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCount = this.stateManager.getState().requestCount;
      const success = newCount > initialCount;
      const state = this.stateManager.getState();
      
      console.log(`✅ Enhanced test completed - Requests captured: ${newCount - initialCount}`, {
        status: response.status,
        initialCount,
        newCount,
        success,
        lastCapturedRequest: state.capturedRequests[state.capturedRequests.length - 1]
      });
      
      return success;
    } catch (error) {
      console.error('❌ Test request failed:', error);
      return false;
    }
  }
}

export const deepNetworkInterceptor = DeepNetworkInterceptor.getInstance();
