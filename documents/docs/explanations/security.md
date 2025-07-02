---
sidebar_position: 3
---

# Security Model

Giải thích về bảo mật trong MongoREST.

## Authentication Flow

```
┌────────┐     ┌────────┐     ┌────────┐
│ Client │────▶│  API   │────▶│   DB   │
└────────┘     └────────┘     └────────┘
    │              │              
    │   1. Login   │              
    │─────────────▶│              
    │              │              
    │   2. Token   │              
    │◀─────────────│              
    │              │              
    │  3. Request  │              
    │  + Token     │              
    │─────────────▶│              
    │              │  4. Query    
    │              │─────────────▶│
    │              │              │
    │  5. Response │  6. Data     │
    │◀─────────────│◀─────────────│
```

## JWT Structure

Token payload:
```javascript
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "john",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "iat": 1616239022,
  "exp": 1616842822
}
```

## Permission Model

### Role-Based Access Control (RBAC)

```json
"collection_name": "products",
"rbac_config": {
  "read": [
    {
      "user_role": "default",
      "patterns": [
        {
          "sku": { "type": "field" }
        },
        {
          "category": { "type": "relation", "relate_collection": "categories" }
        }
      ]
    }
  ]
}
```

## Security Features

### Input Validation
- Schema validation
- SQL injection prevention
- NoSQL injection prevention
- XSS protection

### Rate Limiting
- Per-IP limiting
- Per-user limiting
- Endpoint-specific limits

### Encryption
- Password hashing (bcrypt)
- Token signing (JWT)
- HTTPS enforcement
- Field-level encryption

## Best Practices

1. **Use HTTPS** - Always use SSL/TLS
2. **Strong secrets** - Use long, random JWT secrets
3. **Token expiry** - Set reasonable expiration times
4. **Least privilege** - Give minimum required permissions
5. **Audit logs** - Log all sensitive operations
6. **Input validation** - Always validate user input
7. **Update dependencies** - Keep packages updated