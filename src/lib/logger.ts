export interface LogMetadata {
  event: string;
  projectId?: string;
  userId?: string;
  endpoint?: string;
  durationMs?: number;
  status?: 'success' | 'error' | 'warning' | 'info';
  tokens?: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
  };
  costUsd?: number;
  error?: string;
  [key: string]: unknown;
}

// Cost calculation for Gemini 2.5 Flash
// Input: $0.075 per 1,000,000 tokens
// Output: $0.30 per 1,000,000 tokens
export function calculateGeminiCost(promptTokens: number = 0, responseTokens: number = 0): number {
  const inputCost = (promptTokens / 1_000_000) * 0.075;
  const outputCost = (responseTokens / 1_000_000) * 0.30;
  return Number((inputCost + outputCost).toFixed(6));
}

class Logger {
  private formatLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, metadata?: LogMetadata) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'aggroso-backend',
      ...metadata,
    });
  }

  info(message: string, metadata?: LogMetadata) {
    console.log(this.formatLog('INFO', message, metadata));
  }

  warn(message: string, metadata?: LogMetadata) {
    console.warn(this.formatLog('WARN', message, metadata));
  }

  error(message: string, metadata?: LogMetadata) {
    console.error(this.formatLog('ERROR', message, metadata));
  }

  debug(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('DEBUG', message, metadata));
    }
  }
}

export const logger = new Logger();
