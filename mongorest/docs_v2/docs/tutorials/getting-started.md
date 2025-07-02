---
sidebar_position: 1
---

# Getting Started

Hướng dẫn cài đặt và sử dụng MongoREST cơ bản.

## Cài đặt

### Yêu cầu
- Node.js >= 14
- MongoDB >= 4.0

### Cài đặt MongoREST

```bash
npm install -g mongorest
```

Hoặc trong project:

```bash
npm install mongorest
```

## Khởi động server

### Command line
```bash
mongorest start --db mongodb://localhost:27017/mydb --port 3000
```

### Programmatic
```javascript
const MongoRest = require('mongorest');

const server = new MongoRest({
  db: 'mongodb://localhost:27017/mydb',
  port: 3000
});

server.start();
```

## Test API

Sau khi khởi động, API sẽ có sẵn tại `http://localhost:3000`.

### Lấy danh sách collections
```bash
GET /
```

### Truy vấn dữ liệu
```bash
GET /users
GET /users?name=John
GET /users/507f1f77bcf86cd799439011
```

## Bước tiếp theo

- [Queries cơ bản](./basic-queries)
- [Authentication](./authentication)
- [Configuration](./configuration)