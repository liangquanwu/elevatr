export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  FILE_UPLOAD = 'file_upload',
  VALIDATION = 'validation',
  ERROR = 'error'
}

interface SecurityEventInput {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  details: Record<string, any>;
}

export const logSecurityEvent = (event: SecurityEventInput): void => {
  const logEntry = {
    ...event,
    timestamp: Date.now()
  };

  // In the client, we'll just log to console for now
  // In production, you might want to send these to your backend
  console.log('Security Event:', logEntry);
}; 