import type { InterceptorState, NetworkRequest } from './types';

export class StateManager {
  private state: InterceptorState = {
    isActive: false,
    requestCount: 0,
    lastRequestTime: 0,
    capturedRequests: []
  };

  getState(): InterceptorState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  setActive(active: boolean): void {
    this.state.isActive = active;
  }

  captureRequest(request: NetworkRequest): void {
    this.state.requestCount++;
    this.state.lastRequestTime = Date.now();
    this.state.capturedRequests.push(request);
    
    // Keep only last 1000 requests to prevent memory issues
    if (this.state.capturedRequests.length > 1000) {
      this.state.capturedRequests = this.state.capturedRequests.slice(-500);
    }
  }

  reset(): void {
    this.state.isActive = false;
    this.state.requestCount = 0;
    this.state.lastRequestTime = 0;
    this.state.capturedRequests = [];
  }
}
