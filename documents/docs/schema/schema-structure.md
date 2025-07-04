---
sidebar_position: 2
---

# Schema Structure & Syntax

Hướng dẫn chi tiết về cấu trúc và cú pháp của JSON Schema trong MongoREST.

## Overview

Schema trong MongoREST:
- Định nghĩa cấu trúc dữ liệu cho collections
- Khai báo relationships giữa collections
- Cấu hình permissions và plugins
- Định nghĩa indexes và validation rules

## Basic Schema Structure

### Minimal Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "collection": "products",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "widget": "shortAnswer"
    }
  }
}
```

### Complete Schema Example

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Products Collection",
  "description": "Schema for product catalog",
  "collection": "products",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Product name",
      "widget": "shortAnswer"
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "description": "Product price in USD",
      "widget": "numberInput"
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "discontinued"],
      "default": "active",
      "widget": "select"
    }
  },
  "required": ["name", "price"],
  "additionalProperties": false,
  "relationships": {
    // Relationship definitions
  }
}
```

## Schema Properties

### Standard JSON Schema Properties

#### $schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
Specifies JSON Schema version. Always use draft-07 for MongoREST.

#### title & description
```json
{
  "title": "User Accounts",
  "description": "Schema for user account management"
}
```
Human-readable metadata for documentation.

#### type
```json
{
  "type": "object"
}
```
Root type should always be "object" for MongoDB documents.

#### properties
```json
{
  "properties": {
    "fieldName": {
      "type": "string",
      "description": "Field description",
      "widget": "shortAnswer"
    }
  }
}
```
Defines fields in the document.

#### required
```json
{
  "required": ["name", "email"]
}
```
Array of required field names.

#### additionalProperties
```json
{
  "additionalProperties": false
}
```
Whether to allow fields not defined in properties.

## Data Type Definitions

### String Type

```json
{
  "name": {
    "type": "string",
    "minLength": 1,
    "maxLength": 100,
    "pattern": "^[a-zA-Z0-9 ]+$",
    "format": "email",
    "widget": "shortAnswer"
  }
}
```

**Properties:**
- `minLength`: Minimum string length
- `maxLength`: Maximum string length
- `pattern`: Regex pattern for validation
- `format`: Predefined formats (email, uri, date, etc.)

### Number Type

```json
{
  "price": {
    "type": "number",
    "minimum": 0,
    "maximum": 99999,
    "exclusiveMinimum": false,
    "exclusiveMaximum": false,
    "multipleOf": 0.01,
    "widget": "numberInput"
  }
}
```

**Properties:**
- `minimum/maximum`: Range constraints
- `exclusiveMinimum/Maximum`: Whether min/max is exclusive
- `multipleOf`: Number must be multiple of this value

### Integer Type

```json
{
  "quantity": {
    "type": "integer",
    "minimum": 0,
    "maximum": 9999,
    "widget": "numberInput"
  }
}
```

### Boolean Type

```json
{
  "isActive": {
    "type": "boolean",
    "default": true,
    "widget": "boolean"
  }
}
```

### Array Type

```json
{
  "tags": {
    "type": "array",
    "items": {
      "type": "string",
      "minLength": 1,
      "widget": "shortAnswer"
    },
    "minItems": 0,
    "maxItems": 10,
    "uniqueItems": true,
    "widget": "checkbox"
  }
}
```

**Properties:**
- `items`: Schema for array elements
- `minItems/maxItems`: Array length constraints
- `uniqueItems`: Whether array elements must be unique

### Object Type

```json
{
  "address": {
    "type": "object",
    "properties": {
      "street": { "type": "string", "widget": "shortAnswer" },
      "city": { "type": "string", "widget": "shortAnswer" },
      "zipCode": { "type": "string", "pattern": "^\\d{5}$", "widget": "shortAnswer" }
    },
    "required": ["street", "city"],
    "additionalProperties": false
  }
}
```

### Null Type

```json
{
  "deletedAt": {
    "type": ["string", "null"],
    "format": "date-time",
    "widget": "dateTime"
  }
}
```

## Advanced Schema Features

### Conditional Schemas

```json
{
  "properties": {
    "type": {
      "type": "string",
      "enum": ["individual", "company"],
      "widget": "select"
    }
  },
  "if": {
    "properties": { "type": { "const": "company" } }
  },
  "then": {
    "properties": {
      "companyName": { "type": "string", "widget": "shortAnswer" },
      "taxId": { "type": "string", "widget": "shortAnswer" }
    },
    "required": ["companyName", "taxId"]
  },
  "else": {
    "properties": {
      "firstName": { "type": "string", "widget": "shortAnswer" },
      "lastName": { "type": "string", "widget": "shortAnswer" }
    },
    "required": ["firstName", "lastName"]
  }
}
```

### OneOf/AnyOf/AllOf

```json
{
  "payment": {
    "oneOf": [
      {
        "properties": {
          "type": { "const": "credit_card", "widget": "select" },
          "cardNumber": { "type": "string", "widget": "shortAnswer" },
          "cvv": { "type": "string", "widget": "password" }
        },
        "required": ["cardNumber", "cvv"]
      },
      {
        "properties": {
          "type": { "const": "paypal", "widget": "select" },
          "email": { "type": "string", "format": "email", "widget": "shortAnswer" }
        },
        "required": ["email"]
      }
    ]
  }
}
```

### References ($ref)

```json
{
  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string", "widget": "shortAnswer" },
        "city": { "type": "string", "widget": "shortAnswer" }
      }
    }
  },
  "properties": {
    "shippingAddress": { "$ref": "#/definitions/address" },
    "billingAddress": { "$ref": "#/definitions/address" }
  }
}
```

## Relationship Definitions

### BelongsTo Relationship

```json
{
  "relationships": {
    "author": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "authorId",
      "foreignField": "_id",
      "required": true,
      "onDelete": "restrict"
    }
  }
}
```

### HasMany Relationship

```json
{
  "relationships": {
    "comments": {
      "type": "hasMany",
      "collection": "comments",
      "localField": "_id",
      "foreignField": "postId",
      "defaultSort": { "createdAt": -1 },
      "defaultFilters": { "approved": true },
      "pagination": {
        "defaultLimit": 20,
        "maxLimit": 100
      }
    }
  }
}
```

### ManyToMany Relationship

```json
{
  "relationships": {
    "tags": {
      "type": "manyToMany",
      "collection": "tags",
      "through": "post_tags",
      "localField": "_id",
      "throughLocalField": "postId",
      "throughForeignField": "tagId",
      "foreignField": "_id"
    }
  }
}
```

## Complete Example: E-commerce Product Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product Catalog",
  "collection": "products",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "widget": "shortAnswer"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "widget": "UriKeyGen"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "widget": "textarea"
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 0.01,
      "widget": "numberInput"
    },
    "comparePrice": {
      "type": ["number", "null"],
      "minimum": 0,
      "widget": "numberInput"
    },
    "sku": {
      "type": "string",
      "pattern": "^[A-Z0-9-]+$",
      "widget": "shortAnswer"
    },
    "stock": {
      "type": "integer",
      "minimum": 0,
      "default": 0,
      "widget": "numberInput"
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "discontinued"],
      "default": "active",
      "widget": "select"
    },
    "categoryId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true,
      "widget": "checkbox"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri", "widget": "file" },
          "alt": { "type": "string", "widget": "shortAnswer" }
        },
        "required": ["url"]
      },
      "widget": "multipleFiles"
    },
    "specifications": {
      "type": "object",
      "additionalProperties": { "type": "string", "widget": "shortAnswer" }
    }
  },
  "required": ["name", "price", "sku"],
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "categories",
      "localField": "categoryId",
      "foreignField": "_id"
    },
    "reviews": {
      "type": "hasMany",
      "collection": "reviews",
      "localField": "_id",
      "foreignField": "productId",
      "defaultSort": { "rating": -1 }
    },
    "relatedProducts": {
      "type": "manyToMany",
      "collection": "products",
      "through": "related_products",
      "localField": "_id",
      "throughLocalField": "productId",
      "throughForeignField": "relatedId",
      "foreignField": "_id"
    }
  }
}
```

## Best Practices

### 1. Use Descriptive Names

```json
// ✅ Good
{
  "customerEmail": { "type": "string", "format": "email", "widget": "shortAnswer" }
}

// ❌ Bad
{
  "email": { "type": "string", "widget": "shortAnswer" }
}
```

### 2. Add Descriptions

```json
{
  "price": {
    "type": "number",
    "description": "Product price in USD, excluding tax",
    "widget": "numberInput"
  }
}
```

### 3. Use Appropriate Constraints

```json
{
  "age": {
    "type": "integer",
    "minimum": 0,
    "maximum": 150,
    "widget": "numberInput"
  }
}
```
### 4. Use Enums for Fixed Values

```json
{
  "status": {
    "type": "string",
    "enum": ["pending", "approved", "rejected"],
    "default": "pending",
    "widget": "select"
  }
}
```

## Summary

Schema structure trong MongoREST:

1. **Standard**: Based on JSON Schema draft-07
2. **Extended**: Additional MongoDB-specific features
3. **Flexible**: Support for complex data structures
4. **Powerful**: Built-in validation và relationships
5. **Configurable**: Fine-grained control over behavior

Next: [Field Types →](./field-types)
