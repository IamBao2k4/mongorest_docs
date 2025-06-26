---
sidebar_position: 2
---

# Custom Validation

Thêm validation rules cho data.

## Schema Validation

```javascript
// mongorest.config.js
module.exports = {
  schemas: {
    users: {
      email: {
        type: 'string',
        required: true,
        format: 'email'
      },
      age: {
        type: 'number',
        min: 0,
        max: 150
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'pending']
      }
    }
  }
}
```

## Custom Validators

```javascript
// validators/custom.js
module.exports = {
  users: {
    beforeCreate: async (data) => {
      if (data.age < 18) {
        throw new Error('User must be 18 or older');
      }
      return data;
    },
    beforeUpdate: async (id, data) => {
      if (data.email && !data.email.includes('@')) {
        throw new Error('Invalid email format');
      }
      return data;
    }
  }
}
```

## Regex Patterns

```javascript
{
  validation: {
    patterns: {
      phone: /^\+?[\d\s-()]+$/,
      username: /^[a-zA-Z0-9_]{3,20}$/
    }
  }
}
```

## Error Messages

```javascript
{
  validation: {
    messages: {
      required: 'Field {field} is required',
      email: 'Invalid email format',
      min: 'Value must be at least {min}'
    }
  }
}
```
