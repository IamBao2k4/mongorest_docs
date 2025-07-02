---
sidebar_position: 4
---

# Performance

Hiểu về performance và optimization trong MongoREST.

## Caching Strategy

### Query Cache
```javascript
cache: {
  enabled: true,
  ttl: 300, // 5 minutes
  maxSize: 1000,
  
  // Cache specific collections
  collections: {
    products: { ttl: 3600 }, // 1 hour
    users: { ttl: 60 }       // 1 minute
  }
}
```

### Redis Integration
```javascript
cache: {
  type: 'redis',
  redis: {
    host: 'localhost',
    port: 6379,
    ttl: 300
  }
}
```

## Database Optimization

### Indexes
```javascript
// Compound indexes for common queries
indexes: {
  orders: [
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { status: 1, priority: -1 } }
  ]
}
```

### Query Optimization
- Use projections để giảm data transfer
- Limit results với pagination
- Use aggregation cho complex queries
- Avoid $where và JavaScript execution

## Connection Pooling

```javascript
dbOptions: {
  poolSize: 100,
  minSize: 10,
  maxIdleTimeMS: 10000,
  waitQueueTimeoutMS: 5000
}
```

## Response Optimization

### Compression
```javascript
compression: {
  enabled: true,
  threshold: 1024, // bytes
  level: 6
}
```

### Field Filtering
```bash
# Only get needed fields
GET /users?select=name,email
```

## Monitoring

### Metrics
```javascript
monitoring: {
  enabled: true,
  metrics: {
    requests: true,
    errors: true,
    latency: true,
    database: true
  }
}
```

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": "120MB",
    "limit": "512MB"
  }
}
```

## Best Practices

1. **Use indexes** - Index frequently queried fields
2. **Limit results** - Always use pagination
3. **Cache static data** - Cache rarely changing data
4. **Monitor performance** - Track slow queries
5. **Optimize schemas** - Design efficient data models
6. **Use projections** - Only fetch needed fields