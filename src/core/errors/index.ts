/**
 * Custom error classes for MongoREST core
 */

/**
 * Base error class for all MongoREST errors
 */
export class MongoRESTError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'MONGOREST_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Configuration error - thrown when there's an issue with configuration
 */
export class ConfigurationError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIGURATION_ERROR', 500, details);
  }
}

/**
 * Validation error - thrown when validation fails
 */
export class ValidationError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Authorization error - thrown when user lacks permissions
 */
export class AuthorizationError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
  }
}

/**
 * Adapter error - thrown when adapter operations fail
 */
export class AdapterError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'ADAPTER_ERROR', 500, details);
  }
}

/**
 * Query error - thrown when query processing fails
 */
export class QueryError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'QUERY_ERROR', 400, details);
  }
}

/**
 * Relationship error - thrown when relationship operations fail
 */
export class RelationshipError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'RELATIONSHIP_ERROR', 500, details);
  }
}

/**
 * Not found error - thrown when requested resource doesn't exist
 */
export class NotFoundError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Connection error - thrown when database connection fails
 */
export class ConnectionError extends MongoRESTError {
  constructor(message: string, details?: any) {
    super(message, 'CONNECTION_ERROR', 503, details);
  }
}

/**
 * Type guard to check if an error is a MongoRESTError
 */
export function isMongoRESTError(error: unknown): error is MongoRESTError {
  return error instanceof MongoRESTError;
}

/**
 * Helper function to wrap unknown errors
 */
export function wrapError(error: unknown, defaultMessage: string = 'An unknown error occurred'): MongoRESTError {
  if (isMongoRESTError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new MongoRESTError(error.message, 'WRAPPED_ERROR', 500, {
      originalError: error.name,
      stack: error.stack
    });
  }
  
  return new MongoRESTError(defaultMessage, 'UNKNOWN_ERROR', 500, { originalError: error });
}
