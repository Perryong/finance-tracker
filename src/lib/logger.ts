import { supabase } from './supabase';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type LogStatus = 'SUCCESS' | 'FAILURE' | 'PENDING' | 'PARTIAL';

export interface LogEntry {
  eventType: string;
  userId?: string;
  sessionId?: string;
  actionPerformed: string;
  status?: LogStatus;
  logLevel?: LogLevel;
  errorMessage?: string;
  warningMessage?: string;
  transactionId?: string;
  sourceIp?: string;
  userAgent?: string;
  affectedTable?: string;
  affectedRecordId?: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  metadata?: Record<string, any>;
  requestId?: string;
  executionTimeMs?: number;
}

export class DatabaseLogger {
  private static instance: DatabaseLogger;
  private requestId: string;

  private constructor() {
    this.requestId = this.generateRequestId();
  }

  public static getInstance(): DatabaseLogger {
    if (!DatabaseLogger.instance) {
      DatabaseLogger.instance = new DatabaseLogger();
    }
    return DatabaseLogger.instance;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  private async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  private getClientInfo() {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      // Note: Getting real IP requires server-side implementation
      sourceIp: '127.0.0.1' // Placeholder - would need server-side implementation
    };
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  public async log(entry: LogEntry): Promise<string | null> {
    try {
      const startTime = performance.now();
      const user = await this.getCurrentUser();
      const session = await this.getCurrentSession();
      const clientInfo = this.getClientInfo();

      const { data, error } = await supabase.rpc('log_event', {
        p_event_type: entry.eventType,
        p_user_id: entry.userId || user?.id || null,
        p_session_id: entry.sessionId || session?.access_token?.substring(0, 20) || null,
        p_action_performed: entry.actionPerformed,
        p_status: entry.status || 'SUCCESS',
        p_log_level: entry.logLevel || 'INFO',
        p_error_message: entry.errorMessage || null,
        p_warning_message: entry.warningMessage || null,
        p_transaction_id: entry.transactionId || null,
        p_source_ip: entry.sourceIp || clientInfo.sourceIp,
        p_user_agent: entry.userAgent || clientInfo.userAgent,
        p_affected_table: entry.affectedTable || null,
        p_affected_record_id: entry.affectedRecordId || null,
        p_before_data: entry.beforeData ? this.sanitizeData(entry.beforeData) : null,
        p_after_data: entry.afterData ? this.sanitizeData(entry.afterData) : null,
        p_metadata: entry.metadata ? this.sanitizeData(entry.metadata) : {},
        p_request_id: entry.requestId || this.requestId,
        p_execution_time_ms: entry.executionTimeMs || Math.round(performance.now() - startTime)
      });

      if (error) {
        console.error('Failed to write log entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Logger error:', error);
      return null;
    }
  }

  // Convenience methods for different log levels
  public async debug(eventType: string, actionPerformed: string, metadata?: Record<string, any>) {
    return this.log({
      eventType,
      actionPerformed,
      logLevel: 'DEBUG',
      metadata
    });
  }

  public async info(eventType: string, actionPerformed: string, metadata?: Record<string, any>) {
    return this.log({
      eventType,
      actionPerformed,
      logLevel: 'INFO',
      metadata
    });
  }

  public async warning(eventType: string, actionPerformed: string, warningMessage: string, metadata?: Record<string, any>) {
    return this.log({
      eventType,
      actionPerformed,
      logLevel: 'WARNING',
      warningMessage,
      metadata
    });
  }

  public async error(eventType: string, actionPerformed: string, errorMessage: string, metadata?: Record<string, any>) {
    return this.log({
      eventType,
      actionPerformed,
      logLevel: 'ERROR',
      status: 'FAILURE',
      errorMessage,
      metadata
    });
  }

  public async critical(eventType: string, actionPerformed: string, errorMessage: string, metadata?: Record<string, any>) {
    return this.log({
      eventType,
      actionPerformed,
      logLevel: 'CRITICAL',
      status: 'FAILURE',
      errorMessage,
      metadata
    });
  }

  // Method for logging database operations
  public async logDatabaseOperation(
    operation: string,
    table: string,
    recordId?: string,
    beforeData?: Record<string, any>,
    afterData?: Record<string, any>,
    status: LogStatus = 'SUCCESS',
    errorMessage?: string
  ) {
    return this.log({
      eventType: 'DATABASE_OPERATION',
      actionPerformed: `${operation.toUpperCase()} on ${table}`,
      affectedTable: table,
      affectedRecordId: recordId,
      beforeData,
      afterData,
      status,
      errorMessage,
      logLevel: status === 'SUCCESS' ? 'INFO' : 'ERROR'
    });
  }

  // Method for logging authentication events
  public async logAuthEvent(
    action: string,
    userId?: string,
    status: LogStatus = 'SUCCESS',
    errorMessage?: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      eventType: 'AUTHENTICATION',
      actionPerformed: action,
      userId,
      status,
      errorMessage,
      logLevel: status === 'SUCCESS' ? 'INFO' : 'WARNING',
      metadata
    });
  }

  // Method for logging user actions
  public async logUserAction(
    action: string,
    metadata?: Record<string, any>,
    transactionId?: string
  ) {
    return this.log({
      eventType: 'USER_ACTION',
      actionPerformed: action,
      transactionId,
      logLevel: 'INFO',
      metadata
    });
  }

  // Method for logging system events
  public async logSystemEvent(
    action: string,
    status: LogStatus = 'SUCCESS',
    errorMessage?: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      eventType: 'SYSTEM',
      actionPerformed: action,
      status,
      errorMessage,
      logLevel: status === 'SUCCESS' ? 'INFO' : 'ERROR',
      metadata
    });
  }
}

// Export singleton instance
export const logger = DatabaseLogger.getInstance();

// Example usage:
/*
// Basic logging
await logger.info('USER_REGISTRATION', 'User created new account');

// Database operation logging
await logger.logDatabaseOperation(
  'INSERT',
  'transactions',
  'trans_123',
  undefined,
  { amount: 100, category: 'Food' }
);

// Authentication logging
await logger.logAuthEvent('LOGIN_ATTEMPT', 'user_123', 'SUCCESS');

// Error logging with context
await logger.error(
  'PAYMENT_PROCESSING',
  'Failed to process payment',
  'Insufficient funds',
  { amount: 500, accountBalance: 200 }
);

// Custom detailed logging
await logger.log({
  eventType: 'FINANCIAL_CALCULATION',
  actionPerformed: 'Emergency fund calculation completed',
  logLevel: 'INFO',
  metadata: {
    currentSavings: 5000,
    targetAmount: 10000,
    monthsToGoal: 10
  },
  executionTimeMs: 45
});
*/