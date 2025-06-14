
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
    ? ['ERROR'] // Only log errors in production
    : ['ERROR', 'WARN']; // Reduced logging in development

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
    // Only persist critical errors in production
    if (entry.level === 'ERROR' && this.isProduction) {
      try {
        // Production logging would go here
      } catch (error) {
        // Silently fail to avoid logging loops
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

    console.error(`❌ ${this.formatMessage(entry)}`);
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

    console.warn(`⚠️ ${this.formatMessage(entry)}`);
  }

  info(message: string, data?: any, component?: string) {
    // Info logs disabled to reduce console noise
    return;
  }

  debug(message: string, data?: any, component?: string) {
    // Debug logs disabled to reduce console noise
    return;
  }

  // Método especial para logging de performance - solo en development
  performance(message: string, duration: number, component?: string) {
    if (this.isProduction) return;
    
    if (duration > 2000) {
      const entry: LogEntry = {
        level: 'WARN',
        message: `${message} (${duration}ms)`,
        data: { duration },
        timestamp: new Date(),
        component,
        category: 'performance'
      };
      console.warn(`🐌 ${this.formatMessage(entry)}`);
    }
  }

  // Método para logging de queries específicas - solo errores críticos
  query(queryName: string, duration: number, recordCount?: number, component?: string) {
    // Only log very slow queries as warnings
    if (duration > 5000) {
      this.performance(`Slow Query: ${queryName}`, duration, component);
    }
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
