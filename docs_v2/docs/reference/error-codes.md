# Error Codes Reference

## Tổng quan

MongoREST sử dụng hệ thống error codes chuẩn hóa để giúp developers dễ dàng debug và xử lý lỗi. Mỗi error response đều có cấu trúc consistent với error code, message, và details.

## Error Response Format

```json
{
  "success": false,
  "error": "Error Category",
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    // Additional context
  },
  "timestamp": "2024-01-25T10:30:00Z",
  "requestId": "req_abc123"
}
```

## Error Code Categories

### AUTH_XXX - Authentication Errors

#### AUTH_001 - Invalid Credentials
```json
{
  "code": "AUTH_001",
  "message": "Invalid email or password",
  "details": {
    "email": "user@example.com"
  }
}
```
**Cause**: Wrong email/password combination  
**Solution**: Check credentials and retry

#### AUTH_002 - Token Expired
```json
{
  "code": "AUTH_002",
  "message": "Authentication token has expired",
  "details": {
    "expiredAt": "2024-01-25T10:00:00Z"
  }
}
```
**Cause**: JWT token expired  
**Solution**: Refresh token or re-authenticate

#### AUTH_003 - Invalid Token
```json
{
  "code": "AUTH_003",
  "message": "Invalid authentication token",
  "details": {
    "reason": "Malformed token"
  }
}
```
**Cause**: Token is corrupted or tampered  
**Solution**: Obtain new token

#### AUTH_004 - Insufficient Permissions
```json
{
  "code": "AUTH_004",
  "message": "Insufficient permissions for this operation",
  "details": {
    "required": ["admin"],
    "current": ["user"]
  }
}
```
**Cause**: User lacks required role/permission  
**Solution**: Contact admin for access

#### AUTH_005 - Account Locked
```json
{
  "code": "AUTH_005",
  "message": "Account has been locked due to suspicious activity",
  "details": {
    "reason": "Too many failed login attempts",
    "unlockAt": "2024-01-25T11:00:00Z"
  }
}
```
**Cause**: Security lockout triggered  
**Solution**: Wait for unlock or contact support

### VAL_XXX - Validation Errors

#### VAL_001 - Schema Validation Failed
```json
{
  "code": "VAL_001",
  "message": "Input validation failed",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "not-an-email"
      },
      {
        "field": "age",
        "message": "Must be at least 18",
        "value": 16
      }
    ]
  }
}
```
**Cause**: Input doesn't match schema requirements  
**Solution**: Fix validation errors and retry

#### VAL_002 - Required Field Missing
```json
{
  "code": "VAL_002",
  "message": "Required fields are missing",
  "details": {
    "missing": ["name", "email"]
  }
}
```
**Cause**: Mandatory fields not provided  
**Solution**: Include all required fields

#### VAL_003 - Invalid Data Type
```json
{
  "code": "VAL_003",
  "message": "Invalid data type",
  "details": {
    "field": "price",
    "expected": "number",
    "received": "string",
    "value": "abc"
  }
}
```
**Cause**: Wrong data type for field  
**Solution**: Provide correct data type

#### VAL_004 - Value Out of Range
```json
{
  "code": "VAL_004",
  "message": "Value out of allowed range",
  "details": {
    "field": "quantity",
    "min": 1,
    "max": 100,
    "value": 150
  }
}
```
**Cause**: Value exceeds allowed limits  
**Solution**: Use value within range

#### VAL_005 - Pattern Mismatch
```json
{
  "code": "VAL_005",
  "message": "Value does not match required pattern",
  "details": {
    "field": "sku",
    "pattern": "^[A-Z]{3}-[0-9]{4}$",
    "value": "invalid-sku"
  }
}
```
**Cause**: Value doesn't match regex pattern  
**Solution**: Follow required format

### DB_XXX - Database Errors

#### DB_001 - Connection Failed
```json
{
  "code": "DB_001",
  "message": "Failed to connect to database",
  "details": {
    "host": "mongodb://localhost:27017",
    "error": "Connection timeout"
  }
}
```
**Cause**: Database unreachable  
**Solution**: Check database status and connection

#### DB_002 - Duplicate Key
```json
{
  "code": "DB_002",
  "message": "Duplicate key error",
  "details": {
    "collection": "users",
    "field": "email",
    "value": "existing@example.com"
  }
}
```
**Cause**: Unique constraint violation  
**Solution**: Use different value for unique field

#### DB_003 - Document Not Found
```json
{
  "code": "DB_003",
  "message": "Document not found",
  "details": {
    "collection": "products",
    "id": "507f1f77bcf86cd799439011"
  }
}
```
**Cause**: Requested document doesn't exist  
**Solution**: Verify ID and collection

#### DB_004 - Query Timeout
```json
{
  "code": "DB_004",
  "message": "Database query exceeded timeout",
  "details": {
    "query": "complex aggregation",
    "timeout": 30000,
    "elapsed": 30500
  }
}
```
**Cause**: Query took too long to execute  
**Solution**: Optimize query or increase timeout

#### DB_005 - Transaction Failed
```json
{
  "code": "DB_005",
  "message": "Database transaction failed",
  "details": {
    "operation": "bulkUpdate",
    "reason": "Write conflict"
  }
}
```
**Cause**: Transaction couldn't complete  
**Solution**: Retry transaction

### REL_XXX - Relationship Errors

#### REL_001 - Invalid Relationship
```json
{
  "code": "REL_001",
  "message": "Invalid relationship reference",
  "details": {
    "relationship": "category",
    "collection": "products",
    "reason": "Relationship not defined in schema"
  }
}
```
**Cause**: Trying to access undefined relationship  
**Solution**: Check schema definition

#### REL_002 - Circular Reference
```json
{
  "code": "REL_002",
  "message": "Circular reference detected",
  "details": {
    "path": "category.parent.parent.parent",
    "maxDepth": 3
  }
}
```
**Cause**: Infinite loop in relationships  
**Solution**: Limit relationship depth

#### REL_003 - Invalid Foreign Key
```json
{
  "code": "REL_003",
  "message": "Foreign key reference not found",
  "details": {
    "field": "categoryId",
    "value": "507f1f77bcf86cd799439011",
    "targetCollection": "categories"
  }
}
```
**Cause**: Referenced document doesn't exist  
**Solution**: Use valid foreign key

### QRY_XXX - Query Errors

#### QRY_001 - Invalid Operator
```json
{
  "code": "QRY_001",
  "message": "Invalid query operator",
  "details": {
    "field": "price",
    "operator": "foo",
    "validOperators": ["eq", "gt", "gte", "lt", "lte"]
  }
}
```
**Cause**: Unknown operator used  
**Solution**: Use valid operator

#### QRY_002 - Invalid Syntax
```json
{
  "code": "QRY_002",
  "message": "Invalid query syntax",
  "details": {
    "query": "price=gt.abc",
    "error": "Expected numeric value for 'gt' operator"
  }
}
```
**Cause**: Malformed query string  
**Solution**: Fix query syntax

#### QRY_003 - Query Too Complex
```json
{
  "code": "QRY_003",
  "message": "Query exceeds complexity limit",
  "details": {
    "depth": 6,
    "maxDepth": 5,
    "fields": 150,
    "maxFields": 100
  }
}
```
**Cause**: Query too deep or wide  
**Solution**: Simplify query

#### QRY_004 - Invalid Field Selection
```json
{
  "code": "QRY_004",
  "message": "Invalid field selection",
  "details": {
    "field": "internalSecret",
    "reason": "Field not accessible"
  }
}
```
**Cause**: Trying to select restricted field  
**Solution**: Remove restricted fields

### FUNC_XXX - Function Errors

#### FUNC_001 - Function Not Found
```json
{
  "code": "FUNC_001",
  "message": "Custom function not found",
  "details": {
    "function": "calculateDiscount",
    "available": ["createOrder", "processPayment"]
  }
}
```
**Cause**: Requested function doesn't exist  
**Solution**: Use available function

#### FUNC_002 - Function Execution Failed
```json
{
  "code": "FUNC_002",
  "message": "Function execution failed",
  "details": {
    "function": "sendEmail",
    "step": "smtp_send",
    "error": "SMTP connection failed"
  }
}
```
**Cause**: Error during function execution  
**Solution**: Check function logs

#### FUNC_003 - Invalid Function Input
```json
{
  "code": "FUNC_003",
  "message": "Invalid function parameters",
  "details": {
    "function": "generateReport",
    "errors": [
      {
        "param": "startDate",
        "message": "Must be valid date"
      }
    ]
  }
}
```
**Cause**: Function parameters validation failed  
**Solution**: Provide valid parameters

### RATE_XXX - Rate Limiting Errors

#### RATE_001 - Rate Limit Exceeded
```json
{
  "code": "RATE_001",
  "message": "Rate limit exceeded",
  "details": {
    "limit": 100,
    "window": "1h",
    "remaining": 0,
    "resetAt": "2024-01-25T11:00:00Z"
  }
}
```
**Cause**: Too many requests  
**Solution**: Wait for rate limit reset

#### RATE_002 - Quota Exceeded
```json
{
  "code": "RATE_002",
  "message": "Monthly quota exceeded",
  "details": {
    "quota": 10000,
    "used": 10050,
    "resetAt": "2024-02-01T00:00:00Z"
  }
}
```
**Cause**: Monthly usage limit reached  
**Solution**: Upgrade plan or wait

### SEC_XXX - Security Errors

#### SEC_001 - Suspicious Activity
```json
{
  "code": "SEC_001",
  "message": "Suspicious activity detected",
  "details": {
    "reason": "Multiple login attempts from different locations",
    "action": "Account temporarily locked"
  }
}
```
**Cause**: Security system triggered  
**Solution**: Verify identity with support

#### SEC_002 - IP Blocked
```json
{
  "code": "SEC_002",
  "message": "IP address blocked",
  "details": {
    "ip": "192.168.1.100",
    "reason": "Too many failed attempts",
    "duration": "1h"
  }
}
```
**Cause**: IP temporarily banned  
**Solution**: Wait or contact admin

#### SEC_003 - CORS Violation
```json
{
  "code": "SEC_003",
  "message": "Cross-origin request blocked",
  "details": {
    "origin": "https://evil.com",
    "allowed": ["https://app.example.com"]
  }
}
```
**Cause**: Request from unauthorized origin  
**Solution**: Configure CORS properly

### SYS_XXX - System Errors

#### SYS_001 - Internal Server Error
```json
{
  "code": "SYS_001",
  "message": "An unexpected error occurred",
  "details": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-25T10:30:00Z"
  }
}
```
**Cause**: Unhandled server error  
**Solution**: Report to support with requestId

#### SYS_002 - Service Unavailable
```json
{
  "code": "SYS_002",
  "message": "Service temporarily unavailable",
  "details": {
    "service": "email",
    "reason": "Maintenance",
    "estimatedUptime": "2024-01-25T12:00:00Z"
  }
}
```
**Cause**: Service down for maintenance  
**Solution**: Try again later

#### SYS_003 - Resource Exhausted
```json
{
  "code": "SYS_003",
  "message": "System resources exhausted",
  "details": {
    "resource": "memory",
    "usage": "95%",
    "threshold": "90%"
  }
}
```
**Cause**: System overloaded  
**Solution**: Reduce load or scale up

## HTTP Status Code Mapping

| Error Code Pattern | HTTP Status | Description |
|-------------------|-------------|-------------|
| AUTH_001-003 | 401 | Authentication required |
| AUTH_004 | 403 | Forbidden - lacks permission |
| VAL_XXX | 400 | Bad Request - validation error |
| DB_003 | 404 | Not Found |
| DB_002 | 409 | Conflict - duplicate |
| RATE_XXX | 429 | Too Many Requests |
| SYS_XXX | 500-503 | Server errors |

## Client-Side Error Handling

### JavaScript/TypeScript
```javascript
try {
  const response = await mongorestClient.get('/products');
  // Handle success
} catch (error) {
  if (error.code === 'AUTH_002') {
    // Token expired, refresh
    await refreshToken();
  } else if (error.code === 'VAL_001') {
    // Show validation errors
    showValidationErrors(error.details.errors);
  } else if (error.code.startsWith('DB_')) {
    // Database error, maybe retry
    retryWithBackoff();
  } else {
    // Generic error handling
    showErrorMessage(error.message);
  }
}
```

### Error Recovery Strategies

```javascript
const errorRecovery = {
  'AUTH_002': async () => {
    // Refresh token
    const newToken = await refreshAuthToken();
    setAuthToken(newToken);
    return true; // Retry request
  },
  
  'DB_004': async () => {
    // Query timeout - simplify and retry
    simplifyQuery();
    return true;
  },
  
  'RATE_001': async (error) => {
    // Wait for rate limit reset
    const resetTime = new Date(error.details.resetAt);
    const waitTime = resetTime - Date.now();
    await sleep(waitTime);
    return true;
  },
  
  'SYS_002': async (error) => {
    // Service unavailable - exponential backoff
    await exponentialBackoff();
    return true;
  }
};
```

## Logging & Monitoring

### Error Tracking
```javascript
// Log errors for monitoring
const logError = (error) => {
  monitoring.trackError({
    code: error.code,
    message: error.message,
    category: error.code.split('_')[0],
    requestId: error.requestId,
    userId: getCurrentUserId(),
    timestamp: error.timestamp,
    details: error.details
  });
};
```

### Alert Rules
```javascript
// Alert on critical errors
const alertRules = {
  'DB_001': {
    severity: 'critical',
    alert: 'Database connection lost',
    escalation: ['ops-team', 'on-call']
  },
  'SYS_003': {
    severity: 'high',
    alert: 'Resource exhaustion',
    threshold: 3, // Alert after 3 occurrences
    window: '5m'
  },
  'SEC_001': {
    severity: 'high',
    alert: 'Security incident',
    immediate: true
  }
};
```

## Custom Error Codes

MongoREST allows defining custom error codes:

```javascript
// Register custom error
mongorest.registerError({
  code: 'BIZ_001',
  message: 'Insufficient inventory',
  httpStatus: 400,
  category: 'business'
});

// Usage
throw new MongoRestError('BIZ_001', {
  product: 'iPhone 15',
  requested: 10,
  available: 5
});
```

## Best Practices

1. **Always include error code** in error handling logic
2. **Log errors with context** for debugging
3. **Implement retry logic** for transient errors
4. **Show user-friendly messages** while logging technical details
5. **Monitor error rates** and set up alerts
6. **Document custom errors** in your API documentation

## Next Steps

- Xem [Configuration](./configuration.md) để cấu hình error handling
- Đọc [API Reference](../api-reference/basic-queries.md) để biết error handling examples
- Tham khảo [Security Best Practices](../security/best-practices.md) cho security errors