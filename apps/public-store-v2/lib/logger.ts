/**
 * Sistema de logging condicional para el proyecto
 * Solo muestra logs en desarrollo o cuando está explícitamente habilitado
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development' || process.env.ENABLE_LOGGING === 'true',
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(message: string): string {
    return this.config.prefix ? `${this.config.prefix} ${message}` : message;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message), error, ...args);
    }
  }
}

// Instancias predefinidas para diferentes módulos
export const middlewareLogger = new Logger({
  prefix: '🔧 [MIDDLEWARE]',
  level: 'info'
});

export const storeLogger = new Logger({
  prefix: '🏪 [STORE]',
  level: 'warn'
});

export const cartLogger = new Logger({
  prefix: '🛒 [CART]',
  level: 'error'
});

export const checkoutLogger = new Logger({
  prefix: '💳 [CHECKOUT]',
  level: 'error'
});

// Logger genérico
export const logger = new Logger();

export default logger;