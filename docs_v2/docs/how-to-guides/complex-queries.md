---
sidebar_position: 2
---

# Complex Queries

Hướng dẫn sử dụng queries phức tạp.

## Aggregation

### Pipeline cơ bản
```bash
POST /users/aggregate
Content-Type: application/json

[
  { "$match": { "age": { "$gte": 18 } } },
  { "$group": { 
    "_id": "$city",
    "count": { "$sum": 1 },
    "avgAge": { "$avg": "$age" }
  }},
  { "$sort": { "count": -1 } }
]
```

### Lookup (Join)
```bash
POST /orders/aggregate

[
  {
    "$lookup": {
      "from": "users",
      "localField": "userId",
      "foreignField": "_id",
      "as": "user"
    }
  },
  { "$unwind": "$user" }
]
```

## Full-text Search

### Enable text index
```javascript
indexes: {
  posts: [
    { fields: { title: 'text', content: 'text' } }
  ]
}
```

### Search query
```bash
GET /posts?$text=search.mongodb
```

## Geospatial Queries

### Near query
```bash
GET /stores?location=near.{lng:-73.97,lat:40.77,maxDistance:1000}
```

### Within polygon
```bash
POST /stores/query
{
  "location": {
    "$geoWithin": {
      "$polygon": [[0,0], [3,6], [6,0], [0,0]]
    }
  }
}
```

## Bulk Operations

```bash
POST /users/bulk
[
  { "insertOne": { "document": { "name": "User1" } } },
  { "updateOne": { 
    "filter": { "_id": "123" },
    "update": { "$set": { "status": "active" } }
  }},
  { "deleteOne": { "filter": { "_id": "456" } } }
]
```