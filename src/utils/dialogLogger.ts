
// Servicio para rastrear eventos de diálogos en la aplicación
type DialogEvent = {
  type: 'open' | 'close';
  dialogName: string;
  timestamp: number;
  details?: Record<string, any>;
}

class DialogLogger {
  private events: DialogEvent[] = [];
  private static instance: DialogLogger;

  private constructor() {}

  static getInstance(): DialogLogger {
    if (!DialogLogger.instance) {
      DialogLogger.instance = new DialogLogger();
    }
    return DialogLogger.instance;
  }

  logOpen(dialogName: string, details?: Record<string, any>) {
    const event: DialogEvent = {
      type: 'open',
      dialogName,
      timestamp: Date.now(),
      details
    };
    this.events.push(event);
    console.log(`Dialog opened: ${dialogName}`, event);
    return event;
  }

  logClose(dialogName: string, details?: Record<string, any>) {
    const event: DialogEvent = {
      type: 'close',
      dialogName,
      timestamp: Date.now(),
      details
    };
    this.events.push(event);
    console.log(`Dialog closed: ${dialogName}`, event);
    return event;
  }

  getEvents(): DialogEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  // Obtener eventos como string para facilitar el reporte
  getEventsAsText(): string {
    return this.events.map(event => {
      const date = new Date(event.timestamp);
      return `[${date.toISOString()}] ${event.type.toUpperCase()} - ${event.dialogName} - ${JSON.stringify(event.details || {})}`;
    }).join('\n');
  }
}

export const dialogLogger = DialogLogger.getInstance();
