import * as logger from "firebase-functions/logger";

/**
 * Types of security events that can be logged
 * @enum
 */
export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  FILE_UPLOAD = 'file_upload',
  VALIDATION = 'validation',
  ERROR = 'error'
}

/**
 * Interface for security event input
 * @interface
 */
interface SecurityEventInput {
  /** Type of security event */
  type: SecurityEventType;
  /** User ID associated with the event (optional) */
  userId?: string;
  /** IP address associated with the event (optional) */
  ip?: string;
  /** Additional details about the event */
  details: Record<string, any>;
}

/**
 * Logs a security event with timestamp
 * @param event - The security event to log
 */
export const logSecurityEvent = (event: SecurityEventInput): void => {
  const logEntry = {
    ...event,
    timestamp: Date.now()
  };

  // In the client, we'll just log to console for now
  // In production, you might want to send these to your backend
  console.log('Security Event:', logEntry);
}; 