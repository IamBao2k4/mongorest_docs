---
sidebar_position: 2
---

# Complex Queries

Hướng dẫn sử dụng các queries phức tạp và tối ưu trong MongoREST.

## Overview

Document này bao gồm:
- Function pipelines
- Geospatial queries
- Time-series queries
- Bulk operations
- Query optimization

## Function Pipeline

### Basic Function

```bash
POST /users/aggregate
Content-Type: application/json

[
  { "$match": { "status": "active" } },
  { "$group": {
    "_id": "$department",
    "count": { "$sum": 1 },
    "avgAge": { "$avg": "$age" },
    "minAge": { "$min": "$age" },
    "maxAge": { "$max": "$age" }
  }},
  { "$sort": { "count": -1 } },
  { "$limit": 10 }
]
```

### Complex Function Examples

#### Sales Analytics

```javascript
// Total sales by month with year-over-year comparison
POST /orders/function
[
  // Match orders from last 2 years
  { "$match": {
    "createdAt": {
      "$gte": { "$dateSubtract": { 
        "startDate": "$$NOW", 
        "unit": "year", 
        "amount": 2 
      }}
    },
    "status": "completed"
  }},
  
  // Extract date parts
  { "$addFields": {
    "year": { "$year": "$createdAt" },
    "month": { "$month": "$createdAt" },
    "day": { "$dayOfMonth": "$createdAt" }
  }},
  
  // Group by year and month
  { "$group": {
    "_id": {
      "year": "$year",
      "month": "$month"
    },
    "totalRevenue": { "$sum": "$total" },
    "orderCount": { "$sum": 1 },
    "avgOrderValue": { "$avg": "$total" },
    "uniqueCustomers": { "$addToSet": "$customerId" }
  }},
  
  // Calculate unique customer count
  { "$addFields": {
    "uniqueCustomerCount": { "$size": "$uniqueCustomers" }
  }},
  
  // Remove customer array
  { "$project": { "uniqueCustomers": 0 } },
  
  // Sort by year and month
  { "$sort": { "_id.year": 1, "_id.month": 1 } },
  
  // Reshape for easier consumption
  { "$project": {
    "_id": 0,
    "year": "$_id.year",
    "month": "$_id.month",
    "revenue": "$totalRevenue",
    "orders": "$orderCount",
    "avgOrder": { "$round": ["$avgOrderValue", 2] },
    "customers": "$uniqueCustomerCount"
  }}
]
```

#### User Activity Analysis

```javascript
POST /activities/function
[
  // Match last 30 days
  { "$match": {
    "timestamp": { "$gte": { "$dateSubtract": {
      "startDate": "$$NOW",
      "unit": "day",
      "amount": 30
    }}}
  }},
  
  // Lookup user details
  { "$lookup": {
    "from": "users",
    "localField": "userId",
    "foreignField": "_id",
    "as": "user"
  }},
  { "$unwind": "$user" },
  
  // Group by user and action type
  { "$group": {
    "_id": {
      "userId": "$userId",
      "action": "$action"
    },
    "count": { "$sum": 1 },
    "lastActivity": { "$max": "$timestamp" },
    "userName": { "$first": "$user.name" },
    "userEmail": { "$first": "$user.email" }
  }},
  
  // Regroup by user
  { "$group": {
    "_id": "$_id.userId",
    "name": { "$first": "$userName" },
    "email": { "$first": "$userEmail" },
    "totalActions": { "$sum": "$count" },
    "lastSeen": { "$max": "$lastActivity" },
    "actions": {
      "$push": {
        "type": "$_id.action",
        "count": "$count"
      }
    }
  }},
  
  // Calculate engagement score
  { "$addFields": {
    "engagementScore": {
      "$multiply": [
        "$totalActions",
        { "$size": "$actions" }
      ]
    }
  }},
  
  // Sort by engagement
  { "$sort": { "engagementScore": -1 } },
  { "$limit": 100 }
]
```

### Faceted Search

```javascript
POST /products/function
[
  // Initial match
  { "$match": { "status": "active" } },
  
  // Faceted aggregation
  { "$facet": {
    // Results
    "results": [
      { "$match": { /* search criteria */ } },
      { "$sort": { "price": 1 } },
      { "$skip": 0 },
      { "$limit": 20 }
    ],
    
    // Category counts
    "categories": [
      { "$group": {
        "_id": "$category",
        "count": { "$sum": 1 }
      }},
      { "$sort": { "count": -1 } }
    ],
    
    // Price ranges
    "priceRanges": [
      { "$bucket": {
        "groupBy": "$price",
        "boundaries": [0, 50, 100, 200, 500, 1000],
        "default": "1000+",
        "output": { "count": { "$sum": 1 } }
      }}
    ],
    
    // Brand counts
    "brands": [
      { "$group": {
        "_id": "$brand",
        "count": { "$sum": 1 }
      }},
      { "$sort": { "count": -1 } },
      { "$limit": 20 }
    ],
    
    // Stats
    "stats": [
      { "$group": {
        "_id": null,
        "total": { "$sum": 1 },
        "avgPrice": { "$avg": "$price" },
        "minPrice": { "$min": "$price" },
        "maxPrice": { "$max": "$price" }
      }}
    ]
  }},
  
  // Flatten stats
  { "$addFields": {
    "stats": { "$arrayElemAt": ["$stats", 0] }
  }}
]
```

### GraphLookup for Hierarchical Data

```javascript
// Find all subordinates in org chart
POST /employees/function
[
  { "$match": { "_id": "manager-id" } },
  
  { "$graphLookup": {
    "from": "employees",
    "startWith": "$_id",
    "connectFromField": "_id",
    "connectToField": "managerId",
    "as": "subordinates",
    "maxDepth": 10,
    "depthField": "level"
  }},
  
  // Count by level
  { "$unwind": "$subordinates" },
  { "$group": {
    "_id": "$subordinates.level",
    "count": { "$sum": 1 },
    "employees": { "$push": {
      "name": "$subordinates.name",
      "title": "$subordinates.title"
    }}
  }},
  { "$sort": { "_id": 1 } }
]
```

## Full-Text Search


### Basic Text Search

```bash
# Simple search
GET /posts?field=eq.mongodb

# Phrase search
GET /posts?field=eq."mongodb atlas"

# With text score
GET /posts?field=eq.mongodb&select=title,content,score&order=-score
```

### Advanced Text Search

```javascript
// Search with aggregation
POST /posts/function
[
  { "$match": {
    "$text": { "$search": "mongodb nodejs" }
  }},
  
  // Add text score
  { "$addFields": {
    "score": { "$meta": "textScore" }
  }},
  
  // Filter by minimum score
  { "$match": {
    "score": { "$gte": 1.0 }
  }},
  
  // Boost recent posts
  { "$addFields": {
    "adjustedScore": {
      "$multiply": [
        "$score",
        { "$cond": [
          { "$gte": ["$createdAt", { "$dateSubtract": {
            "startDate": "$$NOW",
            "unit": "day",
            "amount": 7
          }}]},
          1.5,  // Boost factor for recent posts
          1.0
        ]}
      ]
    }
  }},
  
  // Sort by adjusted score
  { "$sort": { "adjustedScore": -1 } },
  
  // Limit results
  { "$limit": 20 }
]
```

### Autocomplete Search

```javascript
// Using like for autocomplete
GET /users?name=like.john&limit=10
```
## Time-Series Queries

### Date Range Queries

```bash
# Specific date range
GET /events?date=gte.2023-01-01&date=lt.2023-02-01

# Relative dates (requires server support)
GET /events?date=gte.today-7d
GET /events?date=gte.thisMonth
GET /events?date=between.lastWeek
```

### Time-Series function

```javascript
// Hourly metrics
POST /metrics/function
[
  { "$match": {
    "timestamp": {
      "$gte": { "$dateSubtract": {
        "startDate": "$$NOW",
        "unit": "day",
        "amount": 1
      }}
    }
  }},
  
  // Group by hour
  { "$group": {
    "_id": {
      "$dateToString": {
        "format": "%Y-%m-%d %H:00",
        "date": "$timestamp"
      }
    },
    "count": { "$sum": 1 },
    "avgValue": { "$avg": "$value" },
    "minValue": { "$min": "$value" },
    "maxValue": { "$max": "$value" }
  }},
  
  { "$sort": { "_id": 1 } }
]
```

## Bulk Operations

### Bulk Write

```javascript
POST /users/bulk
Content-Type: application/json

{
  "operations": [
    // Insert
    {
      "insertOne": {
        "document": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    },
    
    // Update one
    {
      "updateOne": {
        "filter": { "_id": "user123" },
        "update": { "$set": { "status": "active" } },
        "upsert": false
      }
    },
    
    // Update many
    {
      "updateMany": {
        "filter": { "status": "pending" },
        "update": { "$set": { "status": "active" } }
      }
    },
    
    // Replace
    {
      "replaceOne": {
        "filter": { "_id": "user456" },
        "replacement": {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "status": "active"
        }
      }
    },
    
    // Delete one
    {
      "deleteOne": {
        "filter": { "_id": "user789" }
      }
    },
    
    // Delete many
    {
      "deleteMany": {
        "filter": { "status": "deleted" }
      }
    }
  ],
  
  "options": {
    "ordered": true,  // Stop on first error
    "writeConcern": { "w": "majority" }
  }
}
```

## Query Optimization

### Performance Tips

```javascript
// 1. Use projections to reduce data transfer
GET /users?select=name,email&limit=100

// 2. Use covered queries (index contains all fields)
GET /users?email=john@example.com&select=email,status

// 3. Avoid large skip values
// Bad:
GET /users?skip=10000&limit=20

// Good: Use cursor-based pagination
GET /users?cursor=lastId&limit=20

// 4. Use aggregation for complex queries
// Instead of filter after lookup
GET /users?dryRun=false&dbType=mongodb&skip=0&limit=10&select=product_reviews()&and=(status=eq.active,product_reviews.status=eq.approved)

// Filter when lookup
GET /users?dryRun=false&dbType=mongodb&skip=0&limit=10&select=product_reviews(verified=neq.true)&and=(status=eq.active)


// 5. Batch operations
// Instead of:
for (const update of updates) {
  await fetch(`/users/${update.id}`, { method: 'PATCH', body: update });
}

// Use bulk:
await fetch('/users/bulk', { 
  method: 'POST', 
  body: { operations: updates }
});
```

<!-- ### Query Monitoring

```javascript
// Enable query profiling
db: {
  profiling: {
    enabled: true,
    level: 1, // 0=off, 1=slow, 2=all
    slowMs: 100 // Log queries slower than 100ms
  }
}

// Query metrics endpoint
GET /metrics/queries

Response:
{
  "slowQueries": [
    {
      "collection": "orders",
      "query": { "status": "pending" },
      "executionTime": 245,
      "docsExamined": 50000,
      "indexesUsed": [],
      "timestamp": "2023-01-15T10:30:00Z"
    }
  ],
  "queryStats": {
    "total": 10000,
    "avgExecutionTime": 12,
    "slowQueryCount": 45
  }
}
```
 -->

## Next Steps

- [File Uploads](./file-uploads) - Handle file uploads
- [WebSocket](./websocket) - Real-time features
- [Performance](../explanations/performance) - Optimization guide