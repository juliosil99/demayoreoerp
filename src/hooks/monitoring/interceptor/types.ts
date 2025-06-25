
export interface NetworkRequest {
  url: string;
  method: string;
  size: number;
  responseTime: number;
  timestamp: Date;
  sizeCalculationMethod?: string;
  sizeConfidence?: string;
}

export interface InterceptorState {
  isActive: boolean;
  requestCount: number;
  lastRequestTime: number;
  capturedRequests: NetworkRequest[];
}

export interface PendingRequest {
  startTime: number;
  url: string;
  method: string;
}
