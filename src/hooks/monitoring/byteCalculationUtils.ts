
interface ByteCalculationResult {
  size: number;
  method: 'content-length' | 'transfer-size' | 'encoded-body' | 'estimation' | 'text-analysis';
  confidence: 'high' | 'medium' | 'low';
  details?: string;
}

interface EndpointEstimations {
  [key: string]: number;
}

// Estimaciones realistas basadas en patrones típicos de Supabase
const ENDPOINT_SIZE_ESTIMATIONS: EndpointEstimations = {
  // REST API endpoints
  '/rest/v1/rpc/is_admin': 50,
  '/rest/v1/rpc/has_page_access': 60,
  '/rest/v1/rpc/has_permission': 55,
  '/rest/v1/profiles': 200,
  '/rest/v1/companies': 300,
  '/rest/v1/company_users': 150,
  '/rest/v1/Sales': 500,
  '/rest/v1/expenses': 400,
  '/rest/v1/invoices': 600,
  '/rest/v1/contacts': 350,
  '/rest/v1/bank_accounts': 250,
  
  // Edge Functions
  '/functions/v1/get-analytics': 800,
  '/functions/v1/cash-flow-forecast': 1200,
  
  // Auth endpoints
  '/auth/v1/': 150,
  
  // Generic patterns
  'rpc_': 75,          // Generic RPC calls
  'select_': 300,      // Generic SELECT queries
  'insert_': 100,      // Generic INSERT operations
  'update_': 120,      // Generic UPDATE operations
  'function_': 600     // Generic edge functions
};

export class ByteCalculationUtils {
  
  static calculateResponseSize(
    url: string, 
    response?: Response, 
    performanceEntry?: PerformanceResourceTiming
  ): ByteCalculationResult {
    
    console.log(`🧮 Calculating size for: ${url}`);
    
    // Method 1: Content-Length header (highest confidence)
    if (response) {
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 0) {
        const size = parseInt(contentLength, 10);
        console.log(`📏 [HIGH] Content-Length: ${size} bytes for ${url}`);
        return {
          size,
          method: 'content-length',
          confidence: 'high',
          details: `Content-Length header: ${size} bytes`
        };
      }
    }
    
    // Method 2: Performance API transferSize (medium confidence)
    if (performanceEntry && performanceEntry.transferSize > 0) {
      const size = performanceEntry.transferSize;
      console.log(`📊 [MEDIUM] Transfer size: ${size} bytes for ${url}`);
      return {
        size,
        method: 'transfer-size',
        confidence: 'medium',
        details: `Performance transferSize: ${size} bytes`
      };
    }
    
    // Method 3: Performance API encodedBodySize (medium confidence)
    if (performanceEntry && performanceEntry.encodedBodySize > 0) {
      const size = performanceEntry.encodedBodySize;
      console.log(`📊 [MEDIUM] Encoded body size: ${size} bytes for ${url}`);
      return {
        size,
        method: 'encoded-body',
        confidence: 'medium',
        details: `Performance encodedBodySize: ${size} bytes`
      };
    }
    
    // Method 4: Intelligent estimation based on endpoint (low confidence)
    const estimatedSize = this.estimateSizeByEndpoint(url);
    console.log(`🎯 [LOW] Estimated size: ${estimatedSize} bytes for ${url}`);
    
    return {
      size: estimatedSize,
      method: 'estimation',
      confidence: 'low',
      details: `Estimated based on endpoint pattern`
    };
  }
  
  private static estimateSizeByEndpoint(url: string): number {
    try {
      const parsedUrl = new URL(url);
      const pathWithQuery = parsedUrl.pathname + parsedUrl.search;
      
      // Exact match first
      if (ENDPOINT_SIZE_ESTIMATIONS[pathWithQuery]) {
        return ENDPOINT_SIZE_ESTIMATIONS[pathWithQuery];
      }
      
      // Pattern matching
      for (const [pattern, size] of Object.entries(ENDPOINT_SIZE_ESTIMATIONS)) {
        if (pathWithQuery.includes(pattern)) {
          return size;
        }
      }
      
      // Fallback based on endpoint type
      if (pathWithQuery.includes('/rest/v1/rpc/')) return 75;
      if (pathWithQuery.includes('/rest/v1/')) return 300;
      if (pathWithQuery.includes('/functions/v1/')) return 600;
      if (pathWithQuery.includes('/auth/v1/')) return 150;
      
      // Default fallback
      return 200;
      
    } catch (error) {
      console.warn(`❌ Error parsing URL for estimation: ${url}`, error);
      return 200; // Safe default
    }
  }
  
  // Analyze response text size (last resort)
  static async calculateFromText(response: Response): Promise<ByteCalculationResult> {
    try {
      const text = await response.text();
      const size = new TextEncoder().encode(text).length;
      
      return {
        size,
        method: 'text-analysis',
        confidence: 'high',
        details: `Calculated from response text: ${size} bytes`
      };
    } catch (error) {
      console.warn('❌ Error calculating size from text:', error);
      return {
        size: 200,
        method: 'estimation',
        confidence: 'low',
        details: 'Failed to analyze text, using fallback'
      };
    }
  }
}
