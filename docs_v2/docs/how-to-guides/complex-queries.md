---
sidebar_position: 2
---

# Complex Queries

Hướng dẫn sử dụng các queries phức tạp và tối ưu trong MongoREST.

## Overview

Document này bao gồm:
- Aggregation pipelines
- Full-text search
- Geospatial queries
- Time-series queries
- Bulk operations
- Query optimization

## Aggregation Pipeline

### Basic Aggregation

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

### Complex Aggregation Examples

#### Sales Analytics

```javascript
// Total sales by month with year-over-year comparison
POST /orders/aggregate
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
POST /activities/aggregate
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
POST /products/aggregate
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
POST /employees/aggregate
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

### Setup Text Indexes

```javascript
// Schema configuration
schemas: {
  posts: {
    indexes: [
      // Single field text index
      { fields: { title: 'text' } },
      
      // Compound text index
      { fields: { 
        title: 'text', 
        content: 'text',
        tags: 'text'
      }, weights: {
        title: 10,
        tags: 5,
        content: 1
      }},
      
      // Language-specific
      { 
        fields: { content: 'text' },
        default_language: 'english',
        language_override: 'lang'
      }
    ]
  }
}
```

### Basic Text Search

```bash
# Simple search
GET /posts?$text=mongodb

# Phrase search
GET /posts?$text="mongodb atlas"

# Exclude terms
GET /posts?$text=mongodb -sql -mysql

# With text score
GET /posts?$text=mongodb&select=title,content,$score&order=$score.desc
```

### Advanced Text Search

```javascript
// Search with aggregation
POST /posts/aggregate
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
// Using regex for autocomplete
GET /users?name=regex.^john.*&limit=10

// Using text search with partial matching
POST /products/aggregate
[
  { "$search": {
    "index": "autocomplete",
    "autocomplete": {
      "query": "samsu",
      "path": "name",
      "fuzzy": {
        "maxEdits": 2,
        "prefixLength": 3
      }
    }
  }},
  { "$limit": 10 },
  { "$project": {
    "_id": 1,
    "name": 1,
    "category": 1,
    "score": { "$meta": "searchScore" }
  }}
]
```

## Geospatial Queries

### Setup Geospatial Indexes

```javascript
schemas: {
  stores: {
    schema: {
      location: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['Point'] },
          coordinates: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2
          }
        }
      }
    },
    indexes: [
      { fields: { location: '2dsphere' } }
    ]
  }
}
```

### Near Queries

```bash
# Find stores within 5km
GET /stores?location=near.{
  "lng": -73.97,
  "lat": 40.77,
  "maxDistance": 5000,
  "minDistance": 100
}

# With additional filters
GET /stores?location=near.{
  "lng": -73.97,
  "lat": 40.77,
  "maxDistance": 5000
}&status=open&type=restaurant
```

### GeoWithin Queries

```javascript
// Within bounding box
POST /stores/query
{
  "location": {
    "$geoWithin": {
      "$box": [
        [-74.0, 40.7],  // Bottom left
        [-73.9, 40.8]   // Top right
      ]
    }
  }
}

// Within polygon
POST /stores/query
{
  "location": {
    "$geoWithin": {
      "$polygon": [
        [-73.98, 40.75],
        [-73.95, 40.75],
        [-73.95, 40.78],
        [-73.98, 40.78],
        [-73.98, 40.75]
      ]
    }
  }
}

// Within circle (center point + radius)
POST /stores/query
{
  "location": {
    "$geoWithin": {
      "$centerSphere": [
        [-73.97, 40.77],  // Center [lng, lat]
        0.001  // Radius in radians (~ 6.4km)
      ]
    }
  }
}
```

### Geospatial Aggregation

```javascript
// Find nearest stores with details
POST /stores/aggregate
[
  { "$geoNear": {
    "near": {
      "type": "Point",
      "coordinates": [-73.97, 40.77]
    },
    "distanceField": "distance",
    "maxDistance": 5000,
    "query": { "status": "open" },
    "includeLocs": "location",
    "spherical": true
  }},
  
  // Convert distance to km
  { "$addFields": {
    "distanceKm": { "$divide": ["$distance", 1000] }
  }},
  
  // Lookup ratings
  { "$lookup": {
    "from": "reviews",
    "localField": "_id",
    "foreignField": "storeId",
    "as": "reviews"
  }},
  
  // Calculate average rating
  { "$addFields": {
    "avgRating": { "$avg": "$reviews.rating" },
    "reviewCount": { "$size": "$reviews" }
  }},
  
  // Remove reviews array
  { "$project": { "reviews": 0 } },
  
  // Sort by distance
  { "$sort": { "distance": 1 } },
  
  { "$limit": 20 }
]
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

### Time-Series Aggregation

```javascript
// Hourly metrics
POST /metrics/aggregate
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
  
  // Fill missing hours
  { "$densify": {
    "field": "_id",
    "range": {
      "step": 1,
      "unit": "hour",
      "bounds": "full"
    }
  }},
  
  // Default values for missing data
  { "$set": {
    "count": { "$ifNull": ["$count", 0] },
    "avgValue": { "$ifNull": ["$avgValue", 0] }
  }},
  
  { "$sort": { "_id": 1 } }
]
```

### Moving Averages

```javascript
POST /prices/aggregate
[
  { "$match": { "symbol": "AAPL" } },
  { "$sort": { "date": 1 } },
  
  // Calculate moving averages
  { "$setWindowFields": {
    "sortBy": { "date": 1 },
    "output": {
      "ma7": {
        "$avg": "$close",
        "window": {
          "range": [-6, 0],
          "unit": "day"
        }
      },
      "ma30": {
        "$avg": "$close",
        "window": {
          "range": [-29, 0],
          "unit": "day"
        }
      },
      "volume30d": {
        "$sum": "$volume",
        "window": {
          "range": [-29, 0],
          "unit": "day"
        }
      }
    }
  }},
  
  // Add technical indicators
  { "$addFields": {
    "signal": {
      "$cond": [
        { "$gt": ["$ma7", "$ma30"] },
        "buy",
        "sell"
      ]
    }
  }}
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

### Bulk Import

```javascript
// CSV import endpoint
POST /users/import
Content-Type: multipart/form-data

file: users.csv
options: {
  "mapping": {
    "Name": "name",
    "Email Address": "email",
    "Phone": "phone"
  },
  "skipHeader": true,
  "batchSize": 1000,
  "onDuplicate": "skip", // skip, update, error
  "validation": true
}

// JSON import
POST /products/import
Content-Type: application/json

{
  "data": [
    { "name": "Product 1", "price": 99.99 },
    { "name": "Product 2", "price": 149.99 }
  ],
  "options": {
    "validate": true,
    "transform": {
      "price": { "$multiply": ["$price", 1.1] }
    }
  }
}
```

## Query Optimization

### Index Usage

```javascript
// Check query performance
POST /users/explain
{
  "query": { "email": "john@example.com" },
  "options": { "executionStats": true }
}

// Response shows index usage
{
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 1,
    "executionTimeMillis": 0,
    "totalKeysExamined": 1,
    "totalDocsExamined": 1,
    "executionStages": {
      "stage": "IXSCAN",
      "indexName": "email_1"
    }
  }
}
```

### Query Hints

```javascript
// Force specific index
GET /users?email=john@example.com&$hint=email_1

// Force collection scan
GET /users?status=active&$hint=$natural

// With aggregation
POST /orders/aggregate
[
  { "$match": { "customerId": "123" } },
  { "$hint": "customerId_1_createdAt_-1" }
]
```

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
// Instead of multiple queries:
// GET /orders?userId=123
// GET /order-items?orderId=...
// Use aggregation with $lookup

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

### Query Monitoring

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

## Advanced Query Patterns

### Recursive Queries

```javascript
// Find all nested categories
POST /categories/aggregate
[
  { "$match": { "parentId": null } },
  
  { "$graphLookup": {
    "from": "categories",
    "startWith": "$_id",
    "connectFromField": "_id",
    "connectToField": "parentId",
    "as": "subcategories",
    "depthField": "level",
    "maxDepth": 5
  }},
  
  // Build tree structure
  { "$addFields": {
    "tree": {
      "$reduce": {
        "input": "$subcategories",
        "initialValue": {},
        "in": {
          "$mergeObjects": [
            "$$value",
            { "$$this._id": "$$this" }
          ]
        }
      }
    }
  }}
]
```

### Window Functions

```javascript
// Rank products by sales within category
POST /products/aggregate
[
  { "$setWindowFields": {
    "partitionBy": "$category",
    "sortBy": { "salesCount": -1 },
    "output": {
      "rank": { "$rank": {} },
      "percentile": { "$percentileRank": {} },
      "categoryTotal": { "$sum": "$salesCount" }
    }
  }},
  
  // Calculate market share
  { "$addFields": {
    "marketShare": {
      "$multiply": [
        { "$divide": ["$salesCount", "$categoryTotal"] },
        100
      ]
    }
  }},
  
  // Top 3 per category
  { "$match": { "rank": { "$lte": 3 } } },
  
  { "$sort": { "category": 1, "rank": 1 } }
]
```

## Next Steps

- [File Uploads](./file-uploads) - Handle file uploads
- [WebSocket](./websocket) - Real-time features
- [Performance](../explanations/performance) - Optimization guide