---
sidebar_position: 3
---

# Schema Reference

## Tổng Quan

MongoREST sử dụng JSON Schema để định nghĩa cấu trúc dữ liệu và tự động generate APIs. Mỗi collection cần một schema file định nghĩa fields, relationships, và configurations.

## Schema Structure

### Basic Schema Format

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Products Collection",
  "collection": "products",
  "type": "object",
  "properties": {
    // Field definitions
  },
  "required": ["field1", "field2"],
  "relationships": {
    // Relationship definitions
  },
  "indexes": [
    // Index definitions
  ],
  "mongorest": {
    // MongoREST specific configs
  }
}
```

## Field Types Configuration

MongoREST hỗ trợ đa dạng các loại field với widget configurations:

### Text Input Fields

#### 1. Short Answer
```json
{
  "fieldName": {
    "type": "string",
    "widget": "shortAnswer",
    "title": "Field Title",
    "description": "Single line text input"
  }
}
```

#### 2. Password
```json
{
  "password": {
    "type": "string",
    "widget": "password",
    "title": "Password",
    "description": "Masked password input",
    "default": "default_value",
    "minLength": 8,
    "maxLength": 100
  }
}
```

#### 3. Long Answer / Textarea
```json
{
  "description": {
    "type": "string",
    "widget": "textarea",
    "title": "Description",
    "customRole": "textarea",
    "maxLength": 2000,
    "rows": 5
  }
}
```

#### 4. Slug Generator
```json
{
  "slug": {
    "type": "string",
    "widget": "UriKeyGen",
    "title": "URL Slug",
    "sourceField": "title",
    "unique": true
  }
}
```

### Numeric Fields

#### 5. Number Input
```json
{
  "quantity": {
    "type": "string",
    "widget": "numberInput",
    "title": "Quantity",
    "minimum": 0,
    "maximum": 1000,
    "step": 1
  }
}
```

#### 6. Range Slider
```json
{
  "rating": {
    "type": "string",
    "widget": "range",
    "title": "Rating",
    "minimum": 0,
    "maximum": 5,
    "step": 0.5
  }
}
```

### Date/Time Fields

#### 7. Date-Time Picker
```json
{
  "createdAt": {
    "type": "string",
    "widget": "dateTime",
    "title": "Created Date",
    "displayFormat": "yyyy/MM/dd HH:mm:ss",
    "formatDate": "date-time",
    "disabled": false,
    "field": "single",
    "mode": "dateTime"
  }
}
```

#### 8. Date Only
```json
{
  "birthDate": {
    "type": "string",
    "widget": "date",
    "title": "Birth Date",
    "displayFormat": "yyyy/MM/dd",
    "formatDate": "date",
    "mode": "date",
    "minDate": "1900-01-01",
    "maxDate": "Date.now()"
  }
}
```

#### 9. Time Only
```json
{
  "openingTime": {
    "type": "string",
    "widget": "time",
    "title": "Opening Time",
    "displayFormat": "HH:mm:ss",
    "formatDate": "time",
    "min": "00:00:00",
    "max": "23:59:59",
    "mode": "time"
  }
}
```

### Selection Fields

#### 10. Radio Buttons
```json
{
  "gender": {
    "type": "string",
    "widget": "radio",
    "title": "Gender",
    "choices": "male:Male\nfemale:Female\nother:Other",
    "default": "male",
    "allowNull": true,
    "allowCustom": false
  }
}
```

#### 11. Select Dropdown
```json
{
  "category": {
    "type": "string",
    "widget": "select",
    "title": "Category",
    "choices": [
      {"key": "electronics", "value": "Electronics"},
      {"key": "clothing", "value": "Clothing"},
      {"key": "food", "value": "Food & Beverage"}
    ],
    "default": "electronics",
    "allowNull": false,
    "isMultiple": false
  }
}
```

#### 12. Multiple Select
```json
{
  "tags": {
    "type": "string",
    "widget": "select",
    "title": "Tags",
    "choices": [
      {"key": "featured", "value": "Featured"},
      {"key": "sale", "value": "On Sale"},
      {"key": "new", "value": "New Arrival"}
    ],
    "isMultiple": true,
    "allowNull": true
  }
}
```

#### 13. Checkbox Group
```json
{
  "features": {
    "type": "string",
    "widget": "checkbox",
    "title": "Features",
    "choices": [
      {"key": "wifi", "value": "WiFi"},
      {"key": "parking", "value": "Parking"},
      {"key": "pool", "value": "Swimming Pool"}
    ],
    "allowCustom": false,
    "returnValue": 2,
    "layout": 0,
    "toggleAll": true
  }
}
```

#### 14. Boolean Toggle
```json
{
  "isActive": {
    "type": "string",
    "widget": "boolean",
    "title": "Active Status",
    "appearance": "checkbox",
    "default": true
  }
}
```

### Advanced Fields

#### 15. Relation Field
```json
{
  "userId": {
    "type": "string",
    "widget": "relation",
    "title": "User",
    "typeRelation": {
      "title": "User",
      "entity": "users",
      "type": "n-1",
      "displayField": "name",
      "searchFields": ["name", "email"],
      "filter": {
        "combinator": "and",
        "rules": [
          {"field": "status", "operator": "eq", "value": "active"}
        ]
      }
    }
  }
}
```

#### 16. File Upload
```json
{
  "avatar": {
    "type": "string",
    "widget": "file",
    "title": "Avatar",
    "meta": "Upload profile picture",
    "accept": "image/*",
    "maxSize": 5242880
  }
}
```

#### 17. Multiple Files
```json
{
  "attachments": {
    "type": "string",
    "widget": "multipleFiles",
    "title": "Attachments",
    "meta": "Upload multiple files",
    "maxFiles": 10,
    "maxSize": 10485760
  }
}
```

#### 18. Responsive Images
```json
{
  "images": {
    "type": "string",
    "widget": "multiImage",
    "title": "Product Images",
    "fields": ["main", "mainMb", "thumbnail", "thumbnailMb"],
    "sizes": {
      "main": {"width": 1200, "height": 800},
      "mainMb": {"width": 600, "height": 400},
      "thumbnail": {"width": 300, "height": 200},
      "thumbnailMb": {"width": 150, "height": 100}
    }
  }
}
```

#### 19. Condition Builder
```json
{
  "filterCondition": {
    "type": "string",
    "widget": "condition",
    "title": "Filter Condition",
    "typeUI": "filter",
    "fields": ["status", "price", "category"],
    "operators": ["eq", "neq", "gt", "lt", "in", "nin"]
  }
}
```

#### 20. Array Field
```json
{
  "items": {
    "type": "array",
    "title": "Order Items",
    "minItems": 1,
    "maxItems": 100,
    "items": {
      "type": "object",
      "properties": {
        "productId": {"type": "string"},
        "quantity": {"type": "number"},
        "price": {"type": "number"}
      }
    }
  }
}
```

#### 21. Special Widget Fields
```json
{
  // Data widget
  "metadata": {
    "type": "string",
    "widget": "dataWidget",
    "title": "Metadata"
  },
  
  // Hyperlink
  "website": {
    "type": "string",
    "widget": "href",
    "title": "Website",
    "hiddenTitle": true
  },
  
  // Icon selector
  "icon": {
    "type": "string",
    "widget": "icon",
    "title": "Icon",
    "default": "AArrowDown"
  },
  
  // Function editor
  "customFunction": {
    "type": "string",
    "widget": "function",
    "title": "Custom Function"
  }
}
```

## Relationship Definitions

### BelongsTo (N-1)
```json
{
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "categories",
      "localField": "categoryId",
      "foreignField": "_id",
      "required": true
    }
  }
}
```

### HasMany (1-N)
```json
{
  "relationships": {
    "orders": {
      "type": "hasMany",
      "collection": "orders",
      "localField": "_id",
      "foreignField": "customerId",
      "defaultSort": { "createdAt": -1 },
      "pagination": {
        "defaultLimit": 20,
        "maxLimit": 100
      }
    }
  }
}
```

### ManyToMany (N-N)
```json
{
  "relationships": {
    "categories": {
      "type": "manyToMany",
      "collection": "categories",
      "through": "product_categories",
      "localField": "_id",
      "throughLocalField": "productId",
      "throughForeignField": "categoryId",
      "foreignField": "_id"
    }
  }
}
```

## Index Definitions

```json
{
  "indexes": [
    // Single field index
    { "fields": { "email": 1 }, "unique": true },
    
    // Compound index
    { "fields": { "status": 1, "createdAt": -1 } },
    
    // Text index
    { "fields": { "title": "text", "description": "text" } },
    
    // Geospatial index
    { "fields": { "location": "2dsphere" } },
    
    // TTL index
    { "fields": { "expireAt": 1 }, "expireAfterSeconds": 3600 }
  ]
}
```

## MongoREST Configuration

```json
{
  "mongorest": {
    "permissions": {
      "read": ["guest", "user", "admin"],
      "create": ["user", "admin"],
      "update": ["admin"],
      "delete": ["admin"]
    },
    "plugins": {
      "timestamps": true,
      "softDelete": true,
      "versioning": true,
      "audit": true
    },
    "hooks": {
      "beforeCreate": ["validateInventory", "checkDuplicates"],
      "afterCreate": ["updateSearchIndex", "sendNotification"],
      "beforeUpdate": ["validateChanges", "createBackup"],
      "afterUpdate": ["updateCache", "logChanges"],
      "beforeDelete": ["checkReferences", "createBackup"],
      "afterDelete": ["cleanupRelated", "updateStats"]
    },
    "cache": {
      "enabled": true,
      "ttl": 300,
      "invalidateOn": ["create", "update", "delete"]
    },
    "validation": {
      "strict": true,
      "coerceTypes": true,
      "removeAdditional": true
    }
  }
}
```

## Plugin Configuration

### Auto-field Plugins
```json
{
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "updated_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "created_by": {
    "isTurnOn": true,
    "value": "{{user.id}}"
  },
  "tenant_id": {
    "isTurnOn": true,
    "value": "{{user.tenantId}}"
  },
  "expired_at": {
    "isTurnOn": true,
    "value": "Date.now() + 30*24*60*60*1000"
  }
}
```

## Validation Rules

### Common Validation Patterns
```json
{
  // Email validation
  "email": {
    "type": "string",
    "format": "email",
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  },
  
  // Phone validation
  "phone": {
    "type": "string",
    "pattern": "^\\+?[1-9]\\d{1,14}$"
  },
  
  // MongoDB ObjectId
  "userId": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$"
  },
  
  // URL validation
  "website": {
    "type": "string",
    "format": "uri",
    "pattern": "^https?:\\/\\/"
  },
  
  // Enum validation
  "status": {
    "type": "string",
    "enum": ["pending", "active", "suspended", "deleted"]
  }
}
```

## Complete Example Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Products",
  "collection": "products",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "widget": "shortAnswer",
      "title": "Product Name",
      "maxLength": 200,
      "required": true
    },
    "slug": {
      "type": "string",
      "widget": "UriKeyGen",
      "title": "URL Slug",
      "sourceField": "name",
      "unique": true
    },
    "description": {
      "type": "string",
      "widget": "textarea",
      "title": "Description",
      "maxLength": 2000
    },
    "price": {
      "type": "number",
      "widget": "numberInput",
      "title": "Price",
      "minimum": 0,
      "maximum": 999999
    },
    "categoryId": {
      "type": "string",
      "widget": "relation",
      "title": "Category",
      "typeRelation": {
        "entity": "categories",
        "type": "n-1",
        "displayField": "name"
      }
    },
    "tags": {
      "type": "string",
      "widget": "select",
      "title": "Tags",
      "choices": [
        {"key": "featured", "value": "Featured"},
        {"key": "sale", "value": "On Sale"},
        {"key": "new", "value": "New"}
      ],
      "isMultiple": true
    },
    "images": {
      "type": "string",
      "widget": "multiImage",
      "title": "Product Images",
      "fields": ["main", "thumbnail"]
    },
    "status": {
      "type": "string",
      "widget": "radio",
      "title": "Status",
      "choices": "active:Active\ninactive:Inactive",
      "default": "active"
    },
    "featured": {
      "type": "boolean",
      "widget": "boolean",
      "title": "Featured Product",
      "default": false
    }
  },
  "required": ["name", "price", "categoryId"],
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
      "foreignField": "productId"
    }
  },
  "indexes": [
    { "fields": { "slug": 1 }, "unique": true },
    { "fields": { "categoryId": 1 } },
    { "fields": { "price": 1, "status": 1 } },
    { "fields": { "name": "text", "description": "text" } }
  ],
  "mongorest": {
    "permissions": {
      "read": ["guest", "user", "admin"],
      "create": ["admin"],
      "update": ["admin"],
      "delete": ["admin"]
    },
    "plugins": {
      "timestamps": true,
      "softDelete": true
    }
  }
}
```

## Best Practices

1. **Use Appropriate Widget Types**: Choose the right widget for better UX
2. **Set Validation Rules**: Always define min/max, patterns, required fields
3. **Define Indexes**: Add indexes for frequently queried fields
4. **Configure Relationships**: Properly define foreign keys and relationships
5. **Set Permissions**: Configure role-based access for security
6. **Enable Plugins**: Use timestamps and audit plugins for tracking
7. **Add Descriptions**: Help users understand field purposes
8. **Use Enums**: For fields with limited options
9. **Set Defaults**: Provide sensible default values
10. **Test Schemas**: Validate schemas before deployment
