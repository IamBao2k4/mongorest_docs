---
sidebar_position: 1
---

# Getting Started

Hướng dẫn cài đặt và sử dụng MongoREST.

## Giới thiệu

MongoREST là một REST API server tự động cho MongoDB, giúp bạn:
- Tạo REST endpoints cho MongoDB collections một cách tự động
- Không cần viết code backend phức tạp
- Hỗ trợ đầy đủ CRUD operations
- Authentication và authorization tích hợp sẵn
- Query phức tạp với aggregation pipeline

## Yêu cầu hệ thống

### Phần mềm
- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm hoặc yarn

## Cài đặt

### Cài đặt global (khuyến nghị cho development)

```bash
npm install -g mongorest
```

Hoặc với yarn:

```bash
yarn global add mongorest
```

### Cài đặt trong project

```bash
npm install mongorest
```

Hoặc thêm vào package.json:

```json
{
  "dependencies": {
    "mongorest": "^1.0.0"
  }
}
```

### Cài đặt từ source

```bash
git clone https://github.com/mongorest/mongorest.git
cd mongorest
npm install
npm run build
npm link
```

## Khởi động nhanh

### 1. Sử dụng programmatic

Tạo file `server.js`:

```javascript
const MongoRest = require('mongorest');

// Khởi tạo server
const server = new MongoRest({
  db: 'mongodb://localhost:27017/mydb',
  port: 3000,
  host: '0.0.0.0'
});

// Start server
server.start()
  .then(() => {
    console.log('MongoREST server started on port 3000');
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
```

Chạy server:

```bash
node server.js
```

## Cấu hình cơ bản

### File cấu hình

Tạo file `mongorest.config.js`:

```javascript
module.exports = {
  // Database connection
  db: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb',
  
  // Server settings
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  basePath: '/api/v1',
  
  // CORS
  cors: {
    origin: '*',
    credentials: true
  },
  
  // Logging
  logging: {
    level: 'info',
    format: 'json'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};
```

### Environment variables

Tạo file `.env`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mydb
MONGODB_OPTIONS={"useNewUrlParser":true,"useUnifiedTopology":true}

# Server
PORT=3000
HOST=0.0.0.0
BASE_PATH=/api/v1

# Security
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Features
ENABLE_AUTH=true
ENABLE_WEBSOCKET=true
ENABLE_FILE_UPLOAD=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## Test API

### 1. Kiểm tra server status

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 120,
  "database": "connected"
}
```

### 2. CRUD operations cơ bản

#### Create (POST)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

#### Read (GET)
```bash
# Get all users
curl http://localhost:3000/users

# Get specific user
curl http://localhost:3000/users/507f1f77bcf86cd799439011

# With query parameters
curl http://localhost:3000/users?age=gte.18&status=active
```

#### Update (PUT/PATCH)
```bash
# Full update
curl -X PUT http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.new@example.com",
    "age": 31
  }'

# Partial update
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "age": 32
  }'
```

#### Delete (DELETE)
```bash
curl -X DELETE http://localhost:3000/users/507f1f77bcf86cd799439011
```

## Project structure

Khi sử dụng MongoREST trong project:

```
my-project/
├── server.js              # Entry point
├── mongorest.config.js    # Configuration
├── .env                   # Environment variables
├── schemas/              # Schema definitions
│   ├── users.js
│   ├── posts.js
│   └── comments.js
├── hooks/                # Custom hooks
│   ├── auth.js
│   └── validation.js
├── middleware/           # Custom middleware
│   └── logging.js
└── package.json
```

### Ví dụ schema file

`schemas/users.js`:
```javascript
module.exports = {
  // Schema definition
  properies: {
    _id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'MongoDB ObjectId', disabled: true },
    email: {
      type: 'string',
      format: 'email',
      required: true,
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      title: 'Email Address',
      description: 'User email address'
    },
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: '^.{2,100}$',
      title: 'Full Name',
      description: 'Full name'
    },
    profile: {
      type: 'object',
      required: true,
      title: 'User Profile',
      properties: {
        age: { type: 'integer', minimum: 13, maximum: 120, title: 'Age' },
        country: {
          type: 'string',
          enum: ['Vietnam', 'Thailand', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines'],
          title: 'Country'
        },
        interests: {
          type: 'array',
          items: { type: 'string', maxLength: 50 },
          maxItems: 10,
          title: 'Interests'
        },
        avatar: {
          type: 'string',
          format: 'uri',
          pattern: '^(https?://|/).*\\.(jpg|jpeg|png|gif|webp|svg)$',
          title: 'Avatar'
        }
      }
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      title: 'Account Status'
    },
    lastLogin: {
      type: 'string',
      format: 'date-time',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
      title: 'Last Login'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
      title: 'Created At'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
      title: 'Updated At'
    }
  }
}
```

Schema file này có thể được tạo một cách đơn giản trên trang dashboard [Admin dashboard](https://admin-reactjs.mangoads.com.vn)

## Troubleshooting

### Lỗi kết nối MongoDB

```
Error: MongoNetworkError: failed to connect to server
```

Giải pháp:
1. Kiểm tra MongoDB đã chạy chưa: `sudo systemctl status mongod`
2. Kiểm tra connection string
3. Kiểm tra firewall/network settings

## Bước tiếp theo

- [Basic Queries](./basic-queries) - Học cách query dữ liệu
- [Authentication](./authentication) - Bảo mật API với JWT
- [Configuration](./configuration) - Cấu hình nâng cao