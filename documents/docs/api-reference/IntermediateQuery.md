---
sidebar_position: 7
---

# IntermediateQuery Format

## Tổng quan

IntermediateQuery là định dạng trung gian trong MongoREST, đóng vai trò là cầu nối giữa REST API query parameters và MongoDB aggregation pipeline. Format này chuẩn hóa tất cả các loại query từ client trước khi chuyển đổi thành database-specific operations.

## Cấu trúc IntermediateQuery

```typescript
interface IntermediateQuery {
  collection: string;              // Target collection/table
  operation?: 'find' | 'insert' | 'update' | 'delete' | 'aggregate';
  
  // Selection & Projection
  select?: {
    fields?: string[];             // Fields to include
    exclude?: string[];            // Fields to exclude
    aliases?: Record<string, string>; // Field aliases
  };
  
  // Filtering
  filter?: FilterCondition;        // Where conditions
  
  // Relationships
  joins?: JoinClause[];            // Related data joins
  
  // Sorting & Pagination
  sort?: SortClause[];             // Order by
  pagination?: {
    limit?: number;
    skip?: number;
    offset?: number;
  };
  
  // Aggregation
  aggregate?: {
    count?: boolean | 'exact';
    group?: GroupClause;
    having?: FilterCondition;
  };
  
  // Metadata
  metadata?: {
    roles?: string[];              // User roles for RBAC
    timestamp?: Date;              // Query timestamp
    debug?: boolean;               // Debug mode flag
  };
}
```

## Query Conversion Flow

```
REST Query → QueryConverter → IntermediateQuery → PipelineBuilder → MongoDB Pipeline
```

### 1. REST to IntermediateQuery

```bash
# REST Query
GET /api/posts?select=title,author(name)&status=published&order=-createdAt&limit=10

# Converted IntermediateQuery
{
  "collection": "posts",
  "operation": "find",
  "select": {
    "fields": ["title"]
  },
  "filter": {
    "field": "status",
    "operator": "eq",
    "value": "published"
  },
  "joins": [{
    "type": "lookup",
    "target": "author",
    "alias": "author",
    "select": ["name"]
  }],
  "sort": [{
    "field": "createdAt",
    "direction": "desc"
  }],
  "pagination": {
    "limit": 10
  }
}
```

## Filter Conditions

### Simple Filter
```typescript
interface FieldCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'exists';
  value: any;
}
```

### Logical Filter
```typescript
interface LogicalCondition {
  operator: 'and' | 'or' | 'not';
  conditions: FilterCondition[];
}
```

### Ví dụ Complex Filter

```bash
# REST Query với logical operators
?and=(status.eq.active,or=(priority.eq.high,dueDate.lt.2024-01-01))

# IntermediateQuery Filter
{
  "operator": "and",
  "conditions": [
    {
      "field": "status",
      "operator": "eq",
      "value": "active"
    },
    {
      "operator": "or",
      "conditions": [
        {
          "field": "priority",
          "operator": "eq",
          "value": "high"
        },
        {
          "field": "dueDate",
          "operator": "lt",
          "value": "2024-01-01"
        }
      ]
    }
  ]
}
```

## Join Clauses

### Lookup Join (1-1, N-1)
```typescript
{
  "type": "lookup",
  "target": "users",
  "alias": "author",
  "localField": "authorId",
  "foreignField": "_id",
  "select": ["name", "email"],
  "filter": {
    "field": "status",
    "operator": "eq",
    "value": "active"
  }
}
```

### Reverse Lookup (1-N)
```typescript
{
  "type": "reverseLookup",
  "target": "comments",
  "alias": "comments",
  "localField": "_id",
  "foreignField": "postId",
  "select": ["text", "createdAt"],
  "sort": [{ "field": "createdAt", "direction": "desc" }],
  "limit": 5
}
```

### Many-to-Many Join
```typescript
{
  "type": "manyToMany",
  "target": "tags",
  "through": "post_tags",
  "alias": "tags",
  "localField": "_id",
  "throughLocalField": "postId",
  "throughForeignField": "tagId",
  "foreignField": "_id",
  "select": ["name", "color"]
}
```

## Select Clause Features

### Field Selection với Aliases
```typescript
{
  "select": {
    "fields": ["title", "content"],
    "aliases": {
      "fullName": "firstName + ' ' + lastName",
      "shortContent": "substr(content, 0, 100)"
    }
  }
}
```

### Nested Field Selection
```typescript
{
  "select": {
    "fields": [
      "title",
      "author.name",
      "metadata.tags",
      "stats.views"
    ]
  }
}
```

## Advanced Features

### Dynamic Date Handling
```typescript
{
  "filter": {
    "field": "createdAt",
    "operator": "gte",
    "value": {
      "$dynamicDate": "today",
      "offset": -7,
      "unit": "days"
    }
  }
}
```

### Aggregation Queries
```typescript
{
  "collection": "orders",
  "operation": "aggregate",
  "aggregate": {
    "group": {
      "by": ["status", "customerId"],
      "fields": {
        "totalAmount": { "$sum": "$amount" },
        "orderCount": { "$count": {} },
        "avgAmount": { "$avg": "$amount" }
      }
    },
    "having": {
      "field": "totalAmount",
      "operator": "gt",
      "value": 1000
    }
  }
}
```

### Nested Relationship Queries
```typescript
{
  "collection": "users",
  "joins": [
    {
      "type": "lookup",
      "target": "posts",
      "alias": "posts",
      "joins": [
        {
          "type": "lookup",
          "target": "comments",
          "alias": "comments",
          "filter": {
            "field": "approved",
            "operator": "eq",
            "value": true
          }
        }
      ]
    }
  ]
}
```

## RBAC Integration

IntermediateQuery tích hợp với hệ thống RBAC thông qua metadata:

```typescript
{
  "collection": "documents",
  "metadata": {
    "roles": ["admin", "editor"],
    "userId": "user123"
  },
  "filter": {
    "operator": "and",
    "conditions": [
      // User's original filter
      { "field": "status", "operator": "eq", "value": "published" },
      // RBAC injected filter
      {
        "operator": "or",
        "conditions": [
          { "field": "owner", "operator": "eq", "value": "$userId" },
          { "field": "sharedWith", "operator": "in", "value": "$userRoles" }
        ]
      }
    ]
  }
}
```

## Performance Optimizations

### Index Hints
```typescript
{
  "metadata": {
    "hints": {
      "index": "status_createdAt_idx",
      "forceIndex": true
    }
  }
}
```

### Projection Optimization
```typescript
{
  "select": {
    "fields": ["_id", "title", "status"],
    "exclude": ["largeContent", "history"]
  }
}
```

## Validation Rules

1. **Required Fields**
   - `collection` luôn phải có
   - `operation` mặc định là 'find' nếu không chỉ định

2. **Filter Validation**
   - Operators phải hợp lệ với data type
   - Nested conditions không quá 5 levels
   - Array operators (in, nin) phải nhận array values

3. **Join Validation**
   - Target collection phải tồn tại
   - Local/foreign fields phải được định nghĩa
   - Circular joins được phát hiện và ngăn chặn

4. **Pagination Limits**
   - Default limit: 100
   - Maximum limit: 1000
   - Skip không quá 10000 (performance)

## Error Handling

```typescript
// Invalid operator
{
  "error": "InvalidOperator",
  "message": "Operator 'regex' not supported for numeric field 'age'"
}

// Circular reference
{
  "error": "CircularReference", 
  "message": "Circular join detected: users -> posts -> users"
}

// Missing required field
{
  "error": "ValidationError",
  "message": "Missing required field 'collection' in query"
}
```

## Best Practices

✅ **Good Practices**
- Sử dụng field selection để giảm data transfer
- Áp dụng filters sớm trong query chain
- Limit nested joins để tránh performance issues
- Cache IntermediateQuery cho repeated queries

❌ **Avoid**
- Quá nhiều nested joins (>3 levels)
- Select * không cần thiết
- Filters trên unindexed fields
- Large skip values cho pagination

## Tóm tắt

- IntermediateQuery chuẩn hóa mọi query operations
- Hỗ trợ đầy đủ filters, joins, aggregations
- Tích hợp RBAC và performance optimizations
- Validation đảm bảo query integrity
- Foundation cho MongoDB pipeline generation

[Next: Debug Mode →](./debug-mode.md)