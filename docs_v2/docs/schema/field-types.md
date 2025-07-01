---
sidebar_position: 2
---

# Field Types

Hướng dẫn chi tiết về các loại field types được hỗ trợ trong MongoREST schemas.

## Basic Types

### String

```json
{
  "username": {
    "type": "string",
    "minLength": 3,
    "maxLength": 20,
    "pattern": "^[a-zA-Z0-9_]+$",
    "description": "Username for login"
  }
}
```

**Validation options:**
- `minLength`: Minimum string length
- `maxLength`: Maximum string length  
- `pattern`: Regular expression pattern
- `enum`: List of allowed values
- `format`: Predefined formats

**Supported formats:**
- `email`: Email address
- `uri`: URI/URL
- `date`: Date string (YYYY-MM-DD)
- `time`: Time string (HH:mm:ss)
- `date-time`: ISO 8601 date-time
- `ipv4`: IPv4 address
- `ipv6`: IPv6 address
- `hostname`: Internet hostname
- `uuid`: UUID string

### Number

```json
{
  "price": {
    "type": "number",
    "minimum": 0,
    "maximum": 999999.99,
    "multipleOf": 0.01,
    "exclusiveMinimum": true
  }
}
```

**Validation options:**
- `minimum`: Minimum value (inclusive)
- `maximum`: Maximum value (inclusive)
- `exclusiveMinimum`: Make minimum exclusive
- `exclusiveMaximum`: Make maximum exclusive
- `multipleOf`: Value must be multiple of this

### Integer

```json
{
  "quantity": {
    "type": "integer",
    "minimum": 0,
    "maximum": 9999,
    "default": 1
  }
}
```

Same validation options as number, but only accepts whole numbers.

### Boolean

```json
{
  "isActive": {
    "type": "boolean",
    "default": true,
    "description": "Whether the item is active"
  }
}
```

### Null

```json
{
  "deletedAt": {
    "type": ["string", "null"],
    "format": "date-time",
    "default": null
  }
}
```

## Complex Types

### Object

```json
{
  "profile": {
    "type": "object",
    "properties": {
      "firstName": {
        "type": "string",
        "minLength": 1
      },
      "lastName": {
        "type": "string",
        "minLength": 1
      },
      "age": {
        "type": "integer",
        "minimum": 0,
        "maximum": 150
      }
    },
    "required": ["firstName", "lastName"],
    "additionalProperties": false
  }
}
```

**Options:**
- `properties`: Define nested fields
- `required`: Array of required property names
- `additionalProperties`: Allow extra properties
- `minProperties`: Minimum number of properties
- `maxProperties`: Maximum number of properties
- `patternProperties`: Properties matching pattern

### Array

```json
{
  "tags": {
    "type": "array",
    "items": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "minItems": 0,
    "maxItems": 10,
    "uniqueItems": true,
    "default": []
  }
}
```

**Options:**
- `items`: Schema for array elements
- `minItems`: Minimum array length
- `maxItems`: Maximum array length
- `uniqueItems`: Enforce unique elements
- `contains`: At least one item must validate

**Array of objects:**
```json
{
  "addresses": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { "type": "string" }
      },
      "required": ["street", "city"]
    }
  }
}
```

## MongoDB Specific Types

### ObjectId

```json
{
  "userId": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$",
    "description": "MongoDB ObjectId"
  }
}
```

### Date

```json
{
  "createdAt": {
    "type": "string",
    "format": "date-time",
    "description": "ISO 8601 date-time string"
  }
}
```

### GeoJSON

```json
{
  "location": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["Point"]
      },
      "coordinates": {
        "type": "array",
        "items": { "type": "number" },
        "minItems": 2,
        "maxItems": 2
      }
    },
    "required": ["type", "coordinates"]
  }
}
```

### Mixed/Any Type

```json
{
  "metadata": {
    "type": ["object", "array", "string", "number", "boolean", "null"],
    "description": "Flexible metadata field"
  }
}
```

## Advanced Type Features

### Union Types

```json
{
  "price": {
    "type": ["number", "null"],
    "minimum": 0,
    "description": "Price or null if not set"
  }
}
```

### Conditional Types

```json
{
  "properties": {
    "accountType": {
      "type": "string",
      "enum": ["personal", "business"]
    }
  },
  "if": {
    "properties": {
      "accountType": { "const": "business" }
    }
  },
  "then": {
    "properties": {
      "companyName": {
        "type": "string",
        "minLength": 1
      },
      "taxId": {
        "type": "string",
        "pattern": "^\\d{2}-\\d{7}$"
      }
    },
    "required": ["companyName", "taxId"]
  }
}
```

### Enum with Descriptions

```json
{
  "status": {
    "type": "string",
    "enum": ["pending", "approved", "rejected"],
    "enumDescriptions": {
      "pending": "Awaiting review",
      "approved": "Approved and active",
      "rejected": "Rejected by admin"
    },
    "default": "pending"
  }
}
```

### Const Values

```json
{
  "version": {
    "type": "string",
    "const": "1.0",
    "description": "API version"
  }
}
```

## Validation Examples

### Email Field

```json
{
  "email": {
    "type": "string",
    "format": "email",
    "maxLength": 255,
    "transform": ["lowercase", "trim"],
    "uniqueInDb": true
  }
}
```

### Phone Number

```json
{
  "phone": {
    "type": "string",
    "pattern": "^\\+?[1-9]\\d{1,14}$",
    "description": "E.164 format phone number"
  }
}
```

### URL/Website

```json
{
  "website": {
    "type": "string",
    "format": "uri",
    "pattern": "^https?://",
    "maxLength": 2048
  }
}
```

### Password

```json
{
  "password": {
    "type": "string",
    "minLength": 8,
    "maxLength": 128,
    "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]",
    "description": "Must contain uppercase, lowercase, number and special character",
    "writeOnly": true
  }
}
```

### Currency

```json
{
  "amount": {
    "type": "number",
    "minimum": 0,
    "maximum": 999999.99,
    "multipleOf": 0.01,
    "description": "Amount in USD"
  },
  "currency": {
    "type": "string",
    "enum": ["USD", "EUR", "GBP", "JPY"],
    "default": "USD"
  }
}
```

## Custom Validation

### Cross-field Validation

```json
{
  "startDate": {
    "type": "string",
    "format": "date"
  },
  "endDate": {
    "type": "string",
    "format": "date",
    "minimumDate": { "$data": "1/startDate" }
  }
}
```

### Database Unique Constraint

```json
{
  "username": {
    "type": "string",
    "minLength": 3,
    "maxLength": 20,
    "pattern": "^[a-zA-Z0-9_]+$",
    "uniqueInDb": {
      "collection": "users",
      "field": "username",
      "caseSensitive": false
    }
  }
}
```

### Custom Validators

```json
{
  "sku": {
    "type": "string",
    "validators": [
      {
        "name": "uniqueSku",
        "message": "SKU already exists"
      },
      {
        "name": "validSkuFormat",
        "params": { "prefix": "PROD" }
      }
    ]
  }
}
```

## Type Transformations

### String Transformations

```json
{
  "email": {
    "type": "string",
    "format": "email",
    "transform": ["lowercase", "trim"]
  },
  "name": {
    "type": "string",
    "transform": ["trim", "titlecase"]
  }
}
```

**Available transformations:**
- `lowercase`: Convert to lowercase
- `uppercase`: Convert to uppercase
- `trim`: Remove whitespace
- `titlecase`: Title Case Format
- `slugify`: Convert to URL slug

### Number Transformations

```json
{
  "price": {
    "type": "number",
    "transform": ["round:2"],
    "minimum": 0
  }
}
```

## Real-World Examples

### User Profile Schema

```json
{
  "properties": {
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$",
      "uniqueInDb": true,
      "transform": ["lowercase", "trim"]
    },
    "email": {
      "type": "string",
      "format": "email",
      "uniqueInDb": true,
      "transform": ["lowercase", "trim"]
    },
    "profile": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "transform": ["trim", "titlecase"]
        },
        "lastName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "transform": ["trim", "titlecase"]
        },
        "bio": {
          "type": "string",
          "maxLength": 500
        },
        "avatar": {
          "type": "string",
          "format": "uri"
        },
        "birthDate": {
          "type": "string",
          "format": "date"
        },
        "preferences": {
          "type": "object",
          "properties": {
            "newsletter": { "type": "boolean", "default": true },
            "notifications": { "type": "boolean", "default": true }
          }
        }
      }
    },
    "roles": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["user", "moderator", "admin"]
      },
      "default": ["user"],
      "minItems": 1
    }
  },
  "required": ["username", "email"]
}
```

### Product Schema

```json
{
  "properties": {
    "sku": {
      "type": "string",
      "pattern": "^[A-Z]{3}-[0-9]{4}$",
      "uniqueInDb": true
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "description": {
      "type": "string",
      "maxLength": 2000
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "inventory": {
      "type": "object",
      "properties": {
        "quantity": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "reserved": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "available": {
          "type": "integer",
          "minimum": 0,
          "readOnly": true
        }
      }
    },
    "attributes": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "enum": ["red", "blue", "green", "black", "white"]
        },
        "size": {
          "type": "string",
          "enum": ["XS", "S", "M", "L", "XL", "XXL"]
        },
        "material": {
          "type": "string"
        }
      },
      "additionalProperties": {
        "type": "string"
      }
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "format": "uri"
          },
          "alt": {
            "type": "string"
          },
          "isPrimary": {
            "type": "boolean",
            "default": false
          }
        },
        "required": ["url"]
      },
      "minItems": 1,
      "maxItems": 10
    }
  }
}
```

## Best Practices

### 1. Use Appropriate Types

```json
// ✅ Good: Specific types
{
  "age": { "type": "integer", "minimum": 0 },
  "price": { "type": "number", "multipleOf": 0.01 }
}

// ❌ Bad: Everything as string
{
  "age": { "type": "string" },
  "price": { "type": "string" }
}
```

### 2. Add Constraints

```json
// ✅ Good: Proper constraints
{
  "email": {
    "type": "string",
    "format": "email",
    "maxLength": 255
  }
}

// ❌ Bad: No constraints
{
  "email": { "type": "string" }
}
```

### 3. Use Enums for Fixed Values

```json
// ✅ Good: Enum for known values
{
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "pending"]
  }
}

// ❌ Bad: Free-form string
{
  "status": { "type": "string" }
}
```

### 4. Document with Descriptions

```json
// ✅ Good: Clear descriptions
{
  "taxRate": {
    "type": "number",
    "minimum": 0,
    "maximum": 1,
    "description": "Tax rate as decimal (0.1 = 10%)"
  }
}
```

### 5. Set Sensible Defaults

```json
// ✅ Good: Helpful defaults
{
  "status": {
    "type": "string",
    "enum": ["draft", "published"],
    "default": "draft"
  }
}
```

## Summary

Field types trong MongoREST:

1. **Comprehensive**: Support all JSON Schema types
2. **MongoDB-aware**: Special handling for ObjectIds, dates
3. **Validation-rich**: Extensive validation options
4. **Transformable**: Built-in transformations
5. **Extensible**: Custom validators support

MongoREST field types provide a powerful foundation for building robust data schemas that work seamlessly with MongoDB.
