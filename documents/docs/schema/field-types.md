---
sidebar_position: 3
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
    "description": "Username for login",
    "widget": "shortAnswer"
  }
}
```

**Validation options:**
- `minLength`: Minimum string length
- `maxLength`: Maximum string length  
- `pattern`: Regular expression pattern
- `enum`: List of allowed values
- `format`: Predefined formats

**Widget options:**
- `shortAnswer`: Single line text input
- `password`: Password input with masked text
- `textarea`: Multi-line text input
- `UriKeyGen`: Auto-generate URL slug

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
    "exclusiveMinimum": true,
    "widget": "numberInput"
  }
}
```

**Validation options:**
- `minimum`: Minimum value (inclusive)
- `maximum`: Maximum value (inclusive)
- `exclusiveMinimum`: Make minimum exclusive
- `exclusiveMaximum`: Make maximum exclusive
- `multipleOf`: Value must be multiple of this

**Widget options:**
- `numberInput`: Number input field
- `range`: Slider input

### Integer

```json
{
  "quantity": {
    "type": "integer",
    "minimum": 0,
    "maximum": 9999,
    "default": 1,
    "widget": "numberInput"
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
    "description": "Whether the item is active",
    "widget": "boolean",
    "appearance": "checkbox"
  }
}
```

**Widget options:**
- `boolean`: Checkbox or toggle switch
- `appearance`: Visual style (`checkbox`, `switch`)

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
        "minLength": 1,
        "widget": "shortAnswer"
      },
      "lastName": {
        "type": "string",
        "minLength": 1,
        "widget": "shortAnswer"
      },
      "age": {
        "type": "integer",
        "minimum": 0,
        "maximum": 150,
        "widget": "numberInput"
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
        "street": { "type": "string", "widget": "shortAnswer" },
        "city": { "type": "string", "widget": "shortAnswer" },
        "zipCode": { "type": "string", "widget": "shortAnswer" }
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
    "description": "MongoDB ObjectId",
    "widget": "relation",
    "typeRelation": {
      "entity": "users",
      "type": "n-1"
    }
  }
}
```

### Date

```json
{
  "createdAt": {
    "type": "string",
    "format": "date-time",
    "description": "ISO 8601 date-time string",
    "widget": "dateTime",
    "displayFormat": "yyyy/MM/dd HH:mm:ss",
    "mode": "dateTime"
  }
}
```

**Widget options for dates:**
- `date`: Date only picker
- `time`: Time only picker
- `dateTime`: Combined date and time picker

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
    "description": "Flexible metadata field",
    "widget": "dataWidget"
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
    "description": "Price or null if not set",
    "widget": "numberInput"
  }
}
```

### Conditional Types

```json
{
  "properties": {
    "accountType": {
      "type": "string",
      "enum": ["personal", "business"],
      "widget": "radio"
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
        "minLength": 1,
        "widget": "shortAnswer"
      },
      "taxId": {
        "type": "string",
        "pattern": "^\\d{2}-\\d{7}$",
        "widget": "shortAnswer"
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
    "default": "pending",
    "widget": "select",
    "choices": [
      { "key": "pending", "value": "Awaiting review" },
      { "key": "approved", "value": "Approved and active" },
      { "key": "rejected", "value": "Rejected by admin" }
    ]
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
    "uniqueInDb": true,
    "widget": "shortAnswer"
  }
}
```

### Phone Number

```json
{
  "phone": {
    "type": "string",
    "pattern": "^\\+?[1-9]\\d{1,14}$",
    "description": "E.164 format phone number",
    "widget": "shortAnswer"
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
    "maxLength": 2048,
    "widget": "href"
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
    "writeOnly": true,
    "widget": "password"
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
    "description": "Amount in USD",
    "widget": "numberInput"
  },
  "currency": {
    "type": "string",
    "enum": ["USD", "EUR", "GBP", "JPY"],
    "default": "USD",
    "widget": "select"
  }
}
```

## Custom Validation

### Cross-field Validation

```json
{
  "startDate": {
    "type": "string",
    "format": "date",
    "widget": "date"
  },
  "endDate": {
    "type": "string",
    "format": "date",
    "minimumDate": { "$data": "1/startDate" },
    "widget": "date"
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
    },
    "widget": "shortAnswer"
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
    ],
    "widget": "UriKeyGen"
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
    "transform": ["lowercase", "trim"],
    "widget": "shortAnswer"
  },
  "name": {
    "type": "string",
    "transform": ["trim", "titlecase"],
    "widget": "shortAnswer"
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
    "minimum": 0,
    "widget": "numberInput"
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
      "transform": ["lowercase", "trim"],
      "widget": "shortAnswer"
    },
    "email": {
      "type": "string",
      "format": "email",
      "uniqueInDb": true,
      "transform": ["lowercase", "trim"],
      "widget": "shortAnswer"
    },
    "profile": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "transform": ["trim", "titlecase"],
          "widget": "shortAnswer"
        },
        "lastName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "transform": ["trim", "titlecase"],
          "widget": "shortAnswer"
        },
        "bio": {
          "type": "string",
          "maxLength": 500,
          "widget": "textarea"
        },
        "avatar": {
          "type": "string",
          "format": "uri",
          "widget": "file",
          "meta": "Upload avatar image"
        },
        "birthDate": {
          "type": "string",
          "format": "date",
          "widget": "date",
          "displayFormat": "yyyy/MM/dd"
        },
        "preferences": {
          "type": "object",
          "properties": {
            "newsletter": { "type": "boolean", "default": true, "widget": "boolean" },
            "notifications": { "type": "boolean", "default": true, "widget": "boolean" }
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
      "minItems": 1,
      "widget": "checkbox",
      "choices": [
        { "key": "user", "value": "User" },
        { "key": "moderator", "value": "Moderator" },
        { "key": "admin", "value": "Admin" }
      ]
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
      "uniqueInDb": true,
      "widget": "UriKeyGen"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "widget": "shortAnswer"
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
    "inventory": {
      "type": "object",
      "properties": {
        "quantity": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "widget": "numberInput"
        },
        "reserved": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "widget": "numberInput"
        },
        "available": {
          "type": "integer",
          "minimum": 0,
          "readOnly": true,
          "widget": "numberInput"
        }
      }
    },
    "attributes": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "enum": ["red", "blue", "green", "black", "white"],
          "widget": "select"
        },
        "size": {
          "type": "string",
          "enum": ["XS", "S", "M", "L", "XL", "XXL"],
          "widget": "radio"
        },
        "material": {
          "type": "string",
          "widget": "shortAnswer"
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
            "format": "uri",
            "widget": "file"
          },
          "alt": {
            "type": "string",
            "widget": "shortAnswer"
          },
          "isPrimary": {
            "type": "boolean",
            "default": false,
            "widget": "boolean"
          }
        },
        "required": ["url"]
      },
      "minItems": 1,
      "maxItems": 10,
      "widget": "multipleFiles"
    }
  }
}
```

## Widget Types Reference

### Available Widgets by Type

| Data Type | Available Widgets | Common Use Case |
|-----------|------------------|-----------------|
| **string** | `shortAnswer`, `password`, `textarea`, `UriKeyGen` | Text inputs |
| **string (date)** | `date`, `time`, `dateTime` | Date/time pickers |
| **string (enum)** | `select`, `radio`, `checkbox` | Choice selections |
| **string (file)** | `file`, `multipleFiles`, `multiImage` | File uploads |
| **string (special)** | `href`, `icon`, `function`, `condition` | Special inputs |
| **number/integer** | `numberInput`, `range` | Numeric inputs |
| **boolean** | `boolean` | True/false toggles |
| **object** | `dataWidget` | Complex data |
| **array** | Array editor built-in | Lists |
| **relation** | `relation` | Foreign key selection |

## Best Practices

### 1. Use Appropriate Types and Widgets

```json
// ✅ Good: Specific types with appropriate widgets
{
  "age": { "type": "integer", "minimum": 0, "widget": "numberInput" },
  "email": { "type": "string", "format": "email", "widget": "shortAnswer" },
  "bio": { "type": "string", "maxLength": 500, "widget": "textarea" }
}

// ❌ Bad: Everything as string with default widget
{
  "age": { "type": "string" },
  "email": { "type": "string" },
  "bio": { "type": "string" }
}
```

### 2. Add Constraints

```json
// ✅ Good: Proper constraints
{
  "email": {
    "type": "string",
    "format": "email",
    "maxLength": 255,
    "widget": "shortAnswer"
  }
}

// ❌ Bad: No constraints
{
  "email": { "type": "string" }
}
```

### 3. Use Enums for Fixed Values

```json
// ✅ Good: Enum with select widget
{
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "pending"],
    "widget": "select",
    "choices": [
      { "key": "active", "value": "Active" },
      { "key": "inactive", "value": "Inactive" },
      { "key": "pending", "value": "Pending" }
    ]
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
    "description": "Tax rate as decimal (0.1 = 10%)",
    "widget": "numberInput"
  }
}
```

### 5. Set Sensible Defaults

```json
// ✅ Good: Helpful defaults with proper widget
{
  "status": {
    "type": "string",
    "enum": ["draft", "published"],
    "default": "draft",
    "widget": "radio"
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
6. **Widget-enabled**: Rich UI widget types for enhanced user experience

MongoREST field types provide a powerful foundation for building robust data schemas that work seamlessly with MongoDB while offering flexible UI presentation options through various widget types.
