
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  userId?: string;
  component?: string;
  category?: string;
}

class CentralizedLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private enabledLevels: LogLevel[] = this.isProduction 
    ? ['ERROR', 'WARN'] 
    : ['ERROR', 'WARN', 'INFO', 'DEBUG'];

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.includes(level);
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const component = entry.component ? `[${entry.component}]` : '';
    const category = entry.category ? `[${entry.category}]` : '';
    
    return `${timestamp} ${entry.level} ${component}${category} ${entry.message}`;
  }

  private async persistCriticalLog(entry: LogEntry) {
    // Solo persistir logs críticos para evitar consumo excesivo
    if (entry.level === 'ERROR' || (entry.level === 'WARN' && entry.category === 'performance')) {
      try {
        // Simular persistencia - en producción conectaríamos a Supabase
        if (!this.isProduction) {
          console.log('🔄 Would persist to Supabase:', this.formatMessage(entry));
        }
      } catch (error) {
        // Silenciar errores de logging para no crear loops
      }
    }
  }

  error(message: string, data?: any, component?: string) {
    if (!this.shouldLog('ERROR')) return;
    
    const entry: LogEntry = {
      level: 'ERROR',
      message,
      data,
      timestamp: new Date(),
      component,
      category: 'error'
    };

    console.error(`❌ ${this.formatMessage(entry)}`, data || '');
    this.persistCriticalLog(entry);
  }

  warn(message: string, data?: any, component?: string) {
    if (!this.shouldLog('WARN')) return;
    
    const entry: LogEntry = {
      level: 'WARN',
      message,
      data,
      timestamp: new Date(),
      component,
      category: 'warning'
    };

    console.warn(`⚠️ ${this.formatMessage(entry)}`, data || '');
    this.persistCriticalLog(entry);
  }

  info(message: string, data?: any, component?: string) {
    if (!this.shouldLog('INFO')) return;
    
    const entry: LogEntry = {
      level: 'INFO',
      message,
      data,
      timestamp: new Date(),
      component
    };

    console.log(`ℹ️ ${this.formatMessage(entry)}`, data || '');
  }

  debug(message: string, data?: any, component?: string) {
    if (!this.shouldLog('DEBUG')) return;
    
    const entry: LogEntry = {
      level: 'DEBUG',
      message,
      data,
      timestamp: new Date(),
      component
    };

    console.log(`🔍 ${this.formatMessage(entry)}`, data || '');
  }

  // Método especial para logging de performance
  performance(message: string, duration: number, component?: string) {
    const entry: LogEntry = {
      level: duration > 2000 ? 'WARN' : 'INFO',
      message: `${message} (${duration}ms)`,
      data: { duration },
      timestamp: new Date(),
      component,
      category: 'performance'
    };

    if (duration > 2000) {
      console.warn(`🐌 ${this.formatMessage(entry)}`);
      this.persistCriticalLog(entry);
    } else if (!this.isProduction) {
      console.log(`⚡ ${this.formatMessage(entry)}`);
    }
  }

  // Método para logging de queries específicas
  query(queryName: string, duration: number, recordCount?: number, component?: string) {
    const message = `Query: ${queryName}${recordCount ? ` (${recordCount} records)` : ''}`;
    this.performance(message, duration, component);
  }
}

// Instancia global del logger
export const logger = new CentralizedLogger();

// Helper functions para migración gradual
export const logError = (message: string, data?: any, component?: string) => 
  logger.error(message, data, component);

export const logWarning = (message: string, data?: any, component?: string) => 
  logger.warn(message, data, component);

export const logInfo = (message: string, data?: any, component?: string) => 
  logger.info(message, data, component);

export const logDebug = (message: string, data?: any, component?: string) => 
  logger.debug(message, data, component);

export const logPerformance = (message: string, duration: number, component?: string) => 
  logger.performance(message, duration, component);

export const logQuery = (queryName: string, duration: number, recordCount?: number, component?: string) => 
  logger.query(queryName, duration, recordCount, component);
