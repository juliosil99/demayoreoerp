
import { PersistentEgressTracker } from '../PersistentEgressTracker';
import { deepNetworkInterceptor } from '../interceptor/DeepNetworkInterceptor';
import { toast } from 'sonner';

export class DiagnosticsService {
  static getDiagnostics(tracker: PersistentEgressTracker) {
    const interceptorState = deepNetworkInterceptor.getState();
    
    return {
      interceptorActive: deepNetworkInterceptor.isActive(),
      interceptorRequestCount: interceptorState.requestCount,
      lastInterceptorRequest: interceptorState.lastRequestTime,
      ...tracker.getDiagnostics()
    };
  }

  static async runDiagnosticTest(): Promise<boolean> {
    console.log('🔧 Running enhanced comprehensive diagnostic test...');
    
    const success = await deepNetworkInterceptor.testInterceptor();
    
    if (success) {
      toast.success('Test del interceptor mejorado exitoso - datos con bytes reales deberían aparecer pronto');
    } else {
      toast.error('Test del interceptor mejorado falló - revisar consola para detalles');
    }
    
    return success;
  }
}
