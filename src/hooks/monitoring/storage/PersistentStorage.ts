
interface PersistedData {
  requests: Array<{
    endpoint: string;
    size: number;
    timestamp: string;
    method: string;  
    responseTime: number;
    table: string;
    metadata?: {
      sizeCalculationMethod?: string;
      sizeConfidence?: string;
      details?: string;
    };
  }>;
  totalBytes: number;
  startTime: string;
  lastSaved: string;
  version: number;
}

export class PersistentStorage {
  private storageKey = 'egress-tracker-data-v4';

  save(data: {
    requests: Array<any>;
    totalBytes: number;
    startTime: Date;
    version: number;
  }): void {
    try {
      const persistedData: PersistedData = {
        requests: data.requests,
        totalBytes: data.totalBytes,
        startTime: data.startTime.toISOString(),
        lastSaved: new Date().toISOString(),
        version: data.version
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(persistedData));
      
      console.log('💾 Saved enhanced persistent egress data:', {
        requests: data.requests.length,
        totalBytes: data.totalBytes,
        avgBytes: data.requests.length > 0 ? (data.totalBytes / data.requests.length).toFixed(0) : 0,
        version: data.version
      });
    } catch (error) {
      console.warn('⚠️ Could not save persistent data:', error);
    }
  }

  load(): {
    requests: Array<any>;
    totalBytes: number;
    startTime: Date;
    version: number;
  } | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) {
        console.log('📂 No existing persistent data found, starting fresh');
        return null;
      }

      const data: PersistedData = JSON.parse(saved);
      const requests = data.requests.map(req => ({
        ...req,
        timestamp: new Date(req.timestamp)
      }));
      
      console.log('📂 Loaded enhanced persistent egress data:', {
        requests: requests.length,
        totalBytes: data.totalBytes || 0,
        startTime: new Date(data.startTime),
        version: data.version || 0,
        avgBytesPerRequest: requests.length > 0 ? ((data.totalBytes || 0) / requests.length).toFixed(0) : 0
      });

      return {
        requests,
        totalBytes: data.totalBytes || 0,
        startTime: new Date(data.startTime),
        version: data.version || 0
      };
    } catch (error) {
      console.warn('⚠️ Could not load persistent data:', error);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🔄 Enhanced persistent storage cleared completely');
  }
}
