
import { PersistentEgressTracker } from '../PersistentEgressTracker';
import { deepNetworkInterceptor } from '../interceptor/DeepNetworkInterceptor';

export class InitializationService {
  static initializeMonitoring(
    trackerRef: React.MutableRefObject<PersistentEgressTracker>,
    calculateMetrics: () => Promise<void>
  ): () => void {
    console.log('🚀 Initializing enhanced real egress monitor with deep interceptor...');
    
    // Install deep network interceptor with enhanced callback
    deepNetworkInterceptor.install((request) => {
      const tracker = trackerRef.current;
      const parsedUrl = new URL(request.url);
      const endpoint = parsedUrl.pathname + parsedUrl.search;
      
      // Pass enhanced metadata including calculation method and confidence
      tracker.trackRequest(
        endpoint, 
        request.size, 
        request.method, 
        request.responseTime,
        {
          sizeCalculationMethod: (request as any).sizeCalculationMethod,
          sizeConfidence: (request as any).sizeConfidence
        }
      );
    });
    
    // Calculate initial metrics
    calculateMetrics();
    
    // Update metrics every 15 seconds
    const interval = setInterval(() => {
      console.log('⏰ Auto-updating enhanced metrics...');
      calculateMetrics();
    }, 15 * 1000);
    
    return () => {
      clearInterval(interval);
      console.log('🔄 Enhanced monitor cleanup - tracker remains persistent');
    };
  }
}
