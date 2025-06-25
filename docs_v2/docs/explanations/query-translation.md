---
sidebar_position: 2
---

# Query Translation

Cách MongoREST chuyển đổi REST queries sang MongoDB.

## URL to MongoDB

### Basic Translation

REST Query:
```
GET /users?name=John&age=gte.30
```

MongoDB Query:
```javascript
db.users.find({
  name: "John",
  age: { $gte: 30 }
})
```

### Complex Queries

REST Query:
```
GET /users?or=(status=eq.active,role=eq.admin)&age=gte.18
```

MongoDB Query:
```javascript
db.users.find({
  $or: [
    { status: "active" },
    { role: "admin" }
  ],
  age: { $gte: 18 }
})
```

## Operator Mapping

| REST Operator | MongoDB Operator | Example |
|--------------|------------------|---------|
| eq | $eq | ?status=eq.active |
| neq | $ne | ?status=neq.deleted |
| gt | $gt | ?age=gt.18 |
| gte | $gte | ?age=gte.18 |
| lt | $lt | ?price=lt.100 |
| lte | $lte | ?price=lte.100 |
| in | $in | ?status=in.(active,pending) |
| nin | $nin | ?status=nin.(deleted,banned) |
| like | $regex | ?name=like.*john* |

## Special Queries

### Text Search
```
GET /posts?text=mongodb
```
```javascript
db.posts.find({ $text: { $search: "mongodb" } })
```

### Nested Fields
```
GET /users?address.city=eq.NYC
```
```javascript
db.users.find({ "address.city": {"$eq": "NYC"} })
```

### Array Contains
```
GET /posts?tags=cs.mongodb
```
```javascript
db.posts.find({ tags: { $elemMatch: { $eq: "mongodb" } } })
```

## Pagination & Sorting

```
GET /users?limit=10&offset=20&order=name,-age
```
```javascript
db.users
  .find({})
  .sort({ name: 1, age: -1 })
  .skip(20)
  .limit(10)
```

## Field Selection

```
GET /users?select=name,email
```
```javascript
db.users.find({}, { name: 1, email: 1, _id: 1 })
```