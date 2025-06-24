---
sidebar_position: 1
---

# Getting Started

Hướng dẫn cài đặt và sử dụng MongoREST từ cơ bản đến nâng cao.

## Giới thiệu

MongoREST là một REST API server tự động cho MongoDB, giúp bạn:
- Tạo REST endpoints cho MongoDB collections một cách tự động
- Không cần viết code backend phức tạp
- Hỗ trợ đầy đủ CRUD operations
- Authentication và authorization tích hợp sẵn
- Real-time updates với WebSocket
- Query phức tạp với aggregation pipeline

## Yêu cầu hệ thống

### Phần mềm
- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm hoặc yarn

### Hệ điều hành hỗ trợ
- Linux (Ubuntu, CentOS, Debian)
- macOS 10.12+
- Windows 10/11

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

### 1. Sử dụng CLI

Cách nhanh nhất để bắt đầu:

```bash
mongorest start --db mongodb://localhost:27017/mydb
```

Options CLI cơ bản:
- `--db` - MongoDB connection string (bắt buộc)
- `--port` - Port để chạy server (mặc định: 3000)
- `--host` - Host binding (mặc định: 0.0.0.0)
- `--auth` - Enable authentication
- `--config` - Đường dẫn đến file config

### 2. Sử dụng programmatic

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

### 3. Sử dụng Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
RUN npm install -g mongorest
EXPOSE 3000
CMD ["mongorest", "start", "--db", "${MONGODB_URI}"]
```

Docker compose:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  mongorest:
    image: mongorest/mongorest:latest
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/mydb
    depends_on:
      - mongodb

volumes:
  mongo-data:
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

### 2. Liệt kê collections

```bash
curl http://localhost:3000/
```

Response:
```json
{
  "collections": ["users", "posts", "comments"],
  "endpoints": {
    "users": "http://localhost:3000/users",
    "posts": "http://localhost:3000/posts",
    "comments": "http://localhost:3000/comments"
  }
}
```

### 3. CRUD operations cơ bản

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
  schema: {
    name: { type: 'string', required: true },
    email: { type: 'string', format: 'email', required: true },
    password: { type: 'string', required: true, hidden: true },
    age: { type: 'number', min: 0, max: 150 },
    status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: 'date', default: Date.now }
  },
  
  // Indexes
  indexes: [
    { fields: { email: 1 }, unique: true },
    { fields: { createdAt: -1 } }
  ],
  
  // Hooks
  hooks: {
    beforeInsert: async (data) => {
      // Hash password before insert
      const bcrypt = require('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
      return data;
    }
  }
};
```

## Troubleshooting

### Lỗi kết nối MongoDB

```
Error: MongoNetworkError: failed to connect to server
```

Giải pháp:
1. Kiểm tra MongoDB đã chạy chưa: `sudo systemctl status mongod`
2. Kiểm tra connection string
3. Kiểm tra firewall/network settings

### Port đã được sử dụng

```
Error: EADDRINUSE: address already in use :::3000
```

Giải pháp:
1. Đổi port: `mongorest start --port 3001`
2. Hoặc kill process đang dùng port: `lsof -ti:3000 | xargs kill`

### Memory issues

```
FATAL ERROR: JavaScript heap out of memory
```

Giải pháp:
```bash
node --max-old-space-size=4096 server.js
```

## Production deployment

### PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name mongorest

# Auto restart on reboot
pm2 startup
pm2 save
```

### Systemd service

Tạo file `/etc/systemd/system/mongorest.service`:

```ini
[Unit]
Description=MongoREST API Server
After=network.target mongodb.service

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/mongorest
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Kích hoạt service:
```bash
sudo systemctl enable mongorest
sudo systemctl start mongorest
```

## Bước tiếp theo

- [Basic Queries](./basic-queries) - Học cách query dữ liệu
- [Authentication](./authentication) - Bảo mật API với JWT
- [Configuration](./configuration) - Cấu hình nâng cao
- [API Reference](/references/api) - Chi tiết về các endpoints