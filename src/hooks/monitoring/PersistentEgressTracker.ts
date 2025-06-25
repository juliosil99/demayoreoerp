
import type { RequestLog, EgressSource, TrackerStats } from './types';
import { PersistentStorage } from './storage/PersistentStorage';
import { RequestProcessor } from './processing/RequestProcessor';
import { DataAnalyzer } from './analysis/DataAnalyzer';

export class PersistentEgressTracker {
  private static instance: PersistentEgressTracker;
  private requestsLog: RequestLog[] = [];
  private totalBytesTracked: number = 0;
  private startTime: Date = new Date();
  private saveInterval: NodeJS.Timeout | null = null;
  private lastVersion: number = 0;
  private isInitialized: boolean = false;
  private storage: PersistentStorage;

  constructor() {
    this.storage = new PersistentStorage();
  }

  static getInstance(): PersistentEgressTracker {
    if (!PersistentEgressTracker.instance) {
      PersistentEgressTracker.instance = new PersistentEgressTracker();
      PersistentEgressTracker.instance.initialize();
    }
    return PersistentEgressTracker.instance;
  }

  private initialize() {
    if (this.isInitialized) return;
    
    this.loadFromStorage();
    this.startAutoSave();
    this.isInitialized = true;
    
    console.log('🏗️ Enhanced PersistentEgressTracker initialized with better byte tracking');
  }

  private loadFromStorage() {
    const data = this.storage.load();
    if (data) {
      this.requestsLog = data.requests;
      this.totalBytesTracked = data.totalBytes;
      this.startTime = data.startTime;
      this.lastVersion = data.version;
    }
  }

  private saveToStorage() {
    this.lastVersion++;
    this.storage.save({
      requests: this.requestsLog,
      totalBytes: this.totalBytesTracked,
      startTime: this.startTime,
      version: this.lastVersion
    });
  }

  private startAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    // Save every 3 seconds for immediate persistence
    this.saveInterval = setInterval(() => {
      this.saveToStorage();
    }, 3000);
    console.log('⏰ Auto-save started (every 3 seconds)');
  }

  trackRequest(endpoint: string, responseSize: number, method: string, responseTime: number, metadata?: { sizeCalculationMethod?: string; sizeConfidence?: string; details?: string }) {
    const request = RequestProcessor.createRequestLog(endpoint, responseSize, method, responseTime, metadata);

    this.requestsLog.push(request);
    this.totalBytesTracked += responseSize;

    console.log(`📊 [ENHANCED TRACKER] Request tracked:`, {
      endpoint,
      size: `${(responseSize / 1024).toFixed(2)}KB`,
      method,
      table: request.table,
      totalRequests: this.requestsLog.length,
      totalBytes: `${(this.totalBytesTracked / 1024).toFixed(2)}KB`,
      calculationMethod: metadata?.sizeCalculationMethod || 'unknown',
      confidence: metadata?.sizeConfidence || 'unknown'
    });

    // Clean old requests to prevent memory issues
    this.requestsLog = RequestProcessor.cleanOldRequests(this.requestsLog);

    // Save immediately for important requests
    if (responseSize > 50000 || this.requestsLog.length % 5 === 0) {
      this.saveToStorage();
    }
  }

  getTodayBytes(): number {
    return DataAnalyzer.getTodayBytes(this.requestsLog);
  }

  getSourceBreakdown(): EgressSource[] {
    return DataAnalyzer.getSourceBreakdown(this.requestsLog);
  }

  getHourlyBreakdown(): Array<{ hour: number; bytes: number; requests: number }> {
    return DataAnalyzer.getHourlyBreakdown(this.requestsLog);
  }

  getTopEndpoints(limit: number = 10) {
    return DataAnalyzer.getTopEndpoints(this.requestsLog, limit);
  }

  reset() {
    this.requestsLog = [];
    this.totalBytesTracked = 0;
    this.startTime = new Date();
    this.lastVersion = 0;
    this.storage.clear();
    console.log('🔄 Enhanced persistent egress tracker reset completely');
    this.saveToStorage();
  }

  getStats(): TrackerStats {
    const now = new Date();
    const uptimeMs = now.getTime() - this.startTime.getTime();
    const uptimeHours = uptimeMs / (1000 * 60 * 60);
    
    return {
      totalRequests: this.requestsLog.length,
      totalBytes: this.totalBytesTracked,
      uptimeHours: uptimeHours,
      avgBytesPerHour: uptimeHours > 0 ? this.totalBytesTracked / uptimeHours : 0,
      avgRequestSize: this.requestsLog.length > 0 ? this.totalBytesTracked / this.requestsLog.length : 0
    };
  }

  getDiagnostics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRequests = this.requestsLog.filter(req => req.timestamp >= today);
    const uniqueTables = new Set(this.requestsLog.map(req => req.table));
    const uniqueEndpoints = new Set(this.requestsLog.map(req => req.endpoint));
    
    const diagnostics = {
      isActive: this.requestsLog.length > 0,
      totalRequests: this.requestsLog.length,
      todayRequests: todayRequests.length,
      uniqueTables: uniqueTables.size,
      uniqueEndpoints: uniqueEndpoints.size,
      lastRequest: this.requestsLog[this.requestsLog.length - 1]?.timestamp,
      startTime: this.startTime,
      memoryUsage: this.requestsLog.length * 200,
      isPersistent: true,
      version: this.lastVersion,
      isInitialized: this.isInitialized,
      totalBytesTracked: this.totalBytesTracked,
      avgBytesPerRequest: this.requestsLog.length > 0 ? (this.totalBytesTracked / this.requestsLog.length).toFixed(0) : 0
    };
    
    console.log('🔍 Enhanced persistent tracker diagnostics:', diagnostics);
    return diagnostics;
  }

  forceRefresh() {
    console.log('🔄 Force refreshing enhanced persistent tracker data from storage...');
    this.loadFromStorage();
  }

  cleanup() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    this.saveToStorage(); // Final save
    console.log('💾 Final save completed - enhanced tracker remains persistent');
  }
}
