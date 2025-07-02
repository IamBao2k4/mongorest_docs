---
sidebar_position: 3
---

# Authentication

Hướng dẫn cấu hình authentication cho MongoREST.

## Cấu hình JWT

### Enable authentication
```javascript
const server = new MongoRest({
  db: 'mongodb://localhost:27017/mydb',
  auth: {
    enabled: true,
    secret: 'your-secret-key',
    expiresIn: '24h'
  }
});
```

## Login endpoint

MongoREST tự động tạo endpoint login:

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

## Sử dụng token

Gửi token trong header:

```bash
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Quản lý users

### Tạo user mới
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "pass123",
  "role": "user"
}
```

### Roles và permissions

Cấu hình roles:
```javascript
auth: {
  roles: {
    admin: { 
      collections: '*',
      operations: ['GET', 'POST', 'PUT', 'DELETE']
    },
    user: {
      collections: ['posts', 'comments'],
      operations: ['GET', 'POST']
    }
  }
}