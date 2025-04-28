import { HttpsError, onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

/**
 * List of allowed origins for CORS
 * @constant
 */
const ALLOWED_ORIGINS = [
  'https://elevatr-web-client.vercel.app',
  'http://localhost:3000'
];

/**
 * Middleware that adds security headers and CORS protection to HTTP requests
 * @param handler - The HTTP request handler to wrap with security
 * @returns A wrapped HTTP request handler with security features
 */
export const withSecurity = (handler: Function) => {
  return onRequest(async (req, res) => {
    try {
      // Set CORS headers for allowed origins
      const origin = req.headers.origin;
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
      }

      // Set security headers
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
      res.set('X-XSS-Protection', '1; mode=block');
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
      }

      // Log security-relevant information
      logger.info('Security middleware', {
        ip: req.ip,
        method: req.method,
        path: req.path,
        userAgent: req.get('user-agent'),
        origin: req.headers.origin
      });

      await handler(req, res);
    } catch (error) {
      logger.error('Security middleware error', error);
      if (error instanceof HttpsError) {
        res.status(error.httpErrorCode?.status || 500).json({
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          code: 'internal'
        });
      }
    }
  });
}; 