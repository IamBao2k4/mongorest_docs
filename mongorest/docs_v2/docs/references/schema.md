---
sidebar_position: 3
---

# Schema Definition

Chi tiết về định nghĩa schemas.

## Basic Types

```javascript
schemas: {
  users: {
    // String
    name: { type: 'string', required: true },
    
    // Number
    age: { type: 'number', min: 0, max: 150 },
    
    // Boolean
    active: { type: 'boolean', default: true },
    
    // Date
    createdAt: { type: 'date', default: Date.now },
    
    // ObjectId
    userId: { type: 'objectId' },
    
    // Array
    tags: { type: 'array', items: { type: 'string' } },
    
    // Object
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string', pattern: '^[0-9]{5}$' }
      }
    }
  }
}
```

## Validation Rules

### String validation
```javascript
email: {
  type: 'string',
  format: 'email',
  minLength: 5,
  maxLength: 255,
  pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
}
```

### Number validation
```javascript
price: {
  type: 'number',
  min: 0,
  max: 1000000,
  multipleOf: 0.01
}
```

### Array validation
```javascript
items: {
  type: 'array',
  minItems: 1,
  maxItems: 100,
  uniqueItems: true,
  items: {
    type: 'object',
    required: ['name', 'quantity']
  }
}
```

## Custom Validators

```javascript
schemas: {
  users: {
    username: {
      type: 'string',
      validate: async (value) => {
        const exists = await db.users.findOne({ username: value });
        if (exists) throw new Error('Username already exists');
        return true;
      }
    }
  }
}
```

## Indexes

```javascript
indexes: {
  users: [
    { fields: { email: 1 }, unique: true },
    { fields: { username: 1 }, unique: true },
    { fields: { createdAt: -1 } },
    { fields: { name: 'text', bio: 'text' } }
  ]
}