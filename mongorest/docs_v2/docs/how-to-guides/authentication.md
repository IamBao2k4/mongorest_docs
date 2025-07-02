---
sidebar_position: 1
---

# Authentication Setup

Hướng dẫn thiết lập authentication từ A-Z.

## 1. Cấu hình cơ bản

```javascript
const config = {
  auth: {
    enabled: true,
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: '7d',
    refreshToken: true
  }
};
```

## 2. Tạo user collection

```javascript
// Tự động tạo collection 'users'
schemas: {
  users: {
    username: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', default: 'user' },
    createdAt: { type: 'date', default: Date.now }
  }
}
```

## 3. Custom authentication

```javascript
auth: {
  customAuth: async (username, password) => {
    // Custom logic
    const user = await db.users.findOne({ username });
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }
}
```

## 4. OAuth integration

```javascript
auth: {
  oauth: {
    google: {
      clientId: 'your-client-id',
      clientSecret: 'your-secret',
      callbackURL: '/auth/google/callback'
    }
  }
}
```

## 5. API Keys

```javascript
auth: {
  apiKeys: {
    enabled: true,
    header: 'X-API-Key'
  }
}