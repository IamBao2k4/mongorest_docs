---
sidebar_position: 1
---

# Architecture Overview

Hiểu về kiến trúc của MongoREST.

## Tổng quan

MongoREST được xây dựng theo kiến trúc modular với các layers rõ ràng:

```
┌─────────────────┐
│   HTTP Client   │
└────────┬────────┘
         │
┌────────▼────────┐
│   REST API      │
├─────────────────┤
│  Middleware     │
├─────────────────┤
│  Router         │
├─────────────────┤
│  Controllers    │
├─────────────────┤
│  Services       │
├─────────────────┤
│  MongoDB Driver │
└────────┬────────┘
         │
┌────────▼────────┐
│    MongoDB      │
└─────────────────┘
```

## Components

### REST API Layer
- Nhận HTTP requests
- Parse parameters và body
- Validation input
- Format response

### Middleware Layer
- Authentication
- Rate limiting
- CORS handling
- Error handling

### Controller Layer
- Business logic
- Query building
- Hook execution
- Response formatting

### Service Layer
- Database operations
- Schema validation
- Transaction handling
- Cache management

## Request Flow

1. **Request nhận vào** → Middleware stack
2. **Authentication** → Verify JWT/API key
3. **Validation** → Check schema rules
4. **Query Building** → Convert REST to MongoDB query
5. **Hook Execution** → Before hooks
6. **Database Operation** → Execute query
7. **Post Processing** → After hooks
8. **Response** → Format và return

## Design Patterns

### Repository Pattern
Tách biệt data access logic khỏi business logic.

### Middleware Chain
Xử lý requests theo chuỗi responsibility.

### Plugin System
Extend functionality qua plugins.

### Event-Driven
WebSocket events cho real-time updates.