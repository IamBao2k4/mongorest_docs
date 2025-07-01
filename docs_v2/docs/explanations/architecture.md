---
sidebar_position: 1
---

# Kiến Trúc Hệ Thống

## Tổng Quan

MongoREST được thiết kế theo kiến trúc modular với các layers rõ ràng, đảm bảo tính mở rộng và bảo trì dễ dàng.

## Kiến Trúc Tổng Thể

```
┌─────────────────────┐
│   Client Request    │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  JWT Authentication │ ← Xác thực token, extract user info
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   Request Router    │ ← Phân loại request (CRUD/Function)
│  /crud/* /funcs/*   │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   RBAC Middleware   │ ← Kiểm tra quyền truy cập
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Relationship Parser │ ← Parse relationship queries
│  & Filter Handler   │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ MongoDB Aggregation │ ← Build và execute pipelines
│    & Operations     │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   JSON Response     │ ← Format response, add metadata
└─────────────────────┘
```

## Core Components

### 1. Schema Loader

Component này chịu trách nhiệm load và quản lý schemas:

- **Loading Strategy**: Load tất cả schemas vào memory khi khởi động để tránh file I/O trong runtime
- **Validation**: Sử dụng AJV để compile schemas thành validators, cache để tái sử dụng
- **Cross-Reference**: Kiểm tra references giữa schemas (foreign keys, relationships)
- **Hot Reload**: Support reload schemas trong development mode

```javascript
class SchemaLoader {
  private schemas = new Map<string, Schema>();
  private validators = new Map<string, ValidateFunction>();
  
  async loadSchemas() {
    const schemaFiles = await readdir('./schemas/collections');
    
    for (const file of schemaFiles) {
      const schema = await loadSchema(file);
      const validator = ajv.compile(schema);
      
      this.schemas.set(schema.collection, schema);
      this.validators.set(schema.collection, validator);
    }
  }
}
```

### 2. CRUD Generator

Tự động tạo RESTful endpoints cho mỗi collection:

- **Route Generation**: Tạo 5 HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Middleware Chain**: Auth → RBAC → Validation → Handler
- **Query Support**: Filtering, sorting, pagination, field selection, relationships
- **Response Format**: Consistent JSON structure với metadata

```javascript
class CrudGenerator {
  generateRoutes(collection: string, schema: Schema) {
    return {
      list: createListHandler(collection, schema),
      get: createGetHandler(collection, schema),
      create: createCreateHandler(collection, schema),
      update: createUpdateHandler(collection, schema),
      delete: createDeleteHandler(collection, schema)
    };
  }
}
```

### 3. Relationship System

Xử lý relationships giữa collections:

#### Relationship Types

- **belongsTo (N-1)**: Order → Customer
- **hasMany (1-N)**: User → Orders
- **manyToMany (N-N)**: Products ↔ Categories

#### Query Syntax
```
select=name,orders(total,customer(name))
```

#### Implementation
```javascript
class RelationshipResolver {
  async resolve(collection: string, query: RelationshipQuery) {
    const pipeline = [];
    
    // Add $lookup stages for relationships
    for (const rel of query.relationships) {
      pipeline.push({
        $lookup: {
          from: rel.collection,
          localField: rel.localField,
          foreignField: rel.foreignField,
          as: rel.alias
        }
      });
    }
    
    return pipeline;
  }
}
```

### 4. Query Converter Service

Service chuyển đổi API queries thành MongoDB operations:

- **Filter Parsing**: Chuyển `status=eq.active` thành `{ status: "active" }`
- **Operator Support**: 15+ operators (eq, neq, gt, gte, lt, lte, in, nin, like, regex, exists, null, empty)
- **Pipeline Building**: Tạo aggregation pipelines tối ưu
- **Relationship Resolution**: Xử lý joins qua $lookup stages

```javascript
class QueryConverter {
  buildAggregationPipeline(collection: string, queryOptions: IQueryOptions) {
    const pipeline = [];
    
    // Early filtering
    if (queryOptions.filter) {
      pipeline.push({ $match: queryOptions.filter });
    }
    
    // Relationship joins
    if (queryOptions.relationships) {
      pipeline.push(...this.buildRelationshipStages(queryOptions.relationships));
    }
    
    // Projection
    if (queryOptions.select) {
      pipeline.push({ $project: queryOptions.select });
    }
    
    return pipeline;
  }
}
```

## Data Flow

### Request Processing Flow

1. **Client Request** → Fastify server nhận HTTP request
2. **JWT Authentication** → Verify token và extract user info
3. **Route Matching** → Xác định collection và operation
4. **RBAC Check** → Kiểm tra quyền với role và collection
5. **Query Parsing** → Parse parameters thành query options
6. **Schema Validation** → Validate input với JSON Schema
7. **Pipeline Building** → Tạo MongoDB aggregation pipeline
8. **Database Operation** → Execute pipeline với MongoDB
9. **Response Formatting** → Format kết quả và metadata
10. **JSON Response** → Trả về response cho client

### Plugin Processing Flow

1. **Request Data** → Nhận data từ client
2. **Plugin Detection** → Kiểm tra fields match với plugins
3. **Plugin Execution** → Execute plugins với `isTurnOn = true`
4. **Value Injection** → Inject computed values (timestamps, etc.)
5. **Continue Processing** → Tiếp tục normal request flow

## Memory Management

### Schema Caching
- Tất cả schemas được load vào memory khi startup
- Pre-compiled AJV validators để reuse
- Zero file I/O trong runtime operations

### Connection Pooling
```javascript
const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000
};
```

### Query Result Caching
- LRU cache cho frequently accessed data
- Cache key generation từ query parameters
- Automatic invalidation on write operations

## Security Layers

1. **Transport Security**: HTTPS/TLS encryption
2. **Authentication**: JWT token verification
3. **Authorization**: RBAC với field-level permissions
4. **Input Validation**: JSON Schema validation
5. **Query Sanitization**: Prevent injection attacks
6. **Rate Limiting**: Per-role request limits

## Extensibility Points

### Plugin System
- Auto-field plugins (timestamps, audit fields)
- Custom validation plugins
- Transformation plugins

### Hook System
- Before/after hooks cho CRUD operations
- Custom business logic injection
- Event emission cho external systems

### Custom Functions
- Declarative function definitions
- Multi-step workflows
- External API integrations

## Performance Considerations

### Optimization Strategies
1. **Early Filtering**: Apply $match sớm nhất có thể
2. **Index Usage**: Leverage MongoDB indexes
3. **Projection Optimization**: Chỉ select needed fields
4. **Pipeline Optimization**: Minimize pipeline stages
5. **Caching**: Multi-layer caching strategy

### Scalability
- Horizontal scaling với multiple instances
- Stateless design cho easy scaling
- MongoDB replica sets support
- Load balancer compatible

## Technology Stack

- **Runtime**: Node.js với TypeScript
- **Framework**: Fastify cho high performance
- **Database**: MongoDB với native driver
- **Validation**: AJV cho JSON Schema
- **Authentication**: JWT tokens
- **Testing**: Jest với supertest

## Design Patterns

1. **Repository Pattern**: Abstraction cho data access
2. **Factory Pattern**: Dynamic route generation
3. **Strategy Pattern**: Pluggable authentication strategies
4. **Observer Pattern**: Event-driven hooks
5. **Singleton Pattern**: Schema loader instance

## Future Architecture Enhancements

1. **Microservices Support**: Service mesh integration
2. **GraphQL Layer**: Auto-generated GraphQL schema
3. **Event Sourcing**: Audit log với event store
4. **CQRS**: Separate read/write models
5. **Multi-tenancy**: Database-level isolation
