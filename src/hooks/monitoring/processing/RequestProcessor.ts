
import type { RequestLog } from '../types';

export class RequestProcessor {
  static extractTableFromEndpoint(endpoint: string): string {
    try {
      // For REST endpoints: /rest/v1/table_name
      if (endpoint.includes('/rest/v1/')) {
        const match = endpoint.match(/\/rest\/v1\/([^?&/]+)/);
        if (match) return match[1];
      }
      
      // For edge functions: /functions/v1/function_name
      if (endpoint.includes('/functions/v1/')) {
        const match = endpoint.match(/\/functions\/v1\/([^?&/]+)/);
        if (match) return `function:${match[1]}`;
      }
      
      // For auth endpoints
      if (endpoint.includes('/auth/v1/')) {
        return 'auth';
      }
      
      return 'unknown';
    } catch (error) {
      console.warn('Error extracting table from endpoint:', endpoint, error);
      return 'unknown';
    }
  }

  static createRequestLog(
    endpoint: string,
    responseSize: number,
    method: string,
    responseTime: number,
    metadata?: { sizeCalculationMethod?: string; sizeConfidence?: string; details?: string }
  ): RequestLog {
    return {
      endpoint,
      size: responseSize,
      timestamp: new Date(),
      method,
      responseTime,
      table: this.extractTableFromEndpoint(endpoint),
      metadata
    };
  }

  static cleanOldRequests(requests: RequestLog[], maxSize: number = 5000): RequestLog[] {
    if (requests.length <= maxSize) return requests;
    
    const toRemove = requests.length - maxSize + 1000;
    console.log(`🧹 Cleaning ${toRemove} old requests from persistent tracker`);
    
    return requests.slice(toRemove);
  }
}
