---
sidebar_position: 5
---

# Form Schema Configuration

MongoREST hỗ trợ đa dạng các loại field với widget types phong phú, cho phép xây dựng forms động và linh hoạt.

## Tổng Quan

Form Schema định nghĩa:
- **Field types**: Loại dữ liệu và widget hiển thị
- **Validation rules**: Quy tắc validate input
- **UI configuration**: Cách hiển thị trên giao diện
- **Default values**: Giá trị mặc định

## Text Input Fields

### 1. Short Answer

```json
{
  "fieldName": {
    "title": "Field Title",
    "type": "string",
    "widget": "shortAnswer",
    "placeholder": "Enter text...",
    "maxLength": 100
  }
}
```

**Use cases**: Tên, tiêu đề, mã số, short descriptions

### 2. Password

```json
{
  "password": {
    "title": "Password",
    "type": "string",
    "widget": "password",
    "description": "Minimum 8 characters",
    "minLength": 8,
    "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
  }
}
```

**Features**:
- Masked input
- Strength indicator
- Validation patterns

### 3. Long Answer (Textarea)

```json
{
  "description": {
    "title": "Description",
    "type": "string",
    "widget": "textarea",
    "customRole": "textarea",
    "rows": 5,
    "maxLength": 2000
  }
}
```

**Use cases**: Descriptions, comments, notes

### 4. Slug Generator

```json
{
  "slug": {
    "title": "URL Slug",
    "type": "string",
    "widget": "UriKeyGen",
    "sourceField": "title",
    "editable": false
  }
}
```

**Features**:
- Auto-generate từ source field
- URL-safe characters
- Unique validation

## Numeric Fields

### 5. Number Input

```json
{
  "quantity": {
    "title": "Quantity",
    "type": "string",
    "widget": "numberInput",
    "min": 0,
    "max": 9999,
    "step": 1,
    "default": 1
  }
}
```

### 6. Range Slider

```json
{
  "rating": {
    "title": "Rating",
    "type": "string",
    "widget": "range",
    "min": 0,
    "max": 10,
    "step": 0.5,
    "showValue": true
  }
}
```

## Date/Time Fields

### 7. Date-Time Picker

```json
{
  "scheduledAt": {
    "title": "Schedule Date & Time",
    "type": "string",
    "widget": "dateTime",
    "displayFormat": "yyyy/MM/dd HH:mm:ss",
    "formatDate": "date-time",
    "disabled": false,
    "field": "single",
    "mode": "dateTime",
    "minDate": "Date.now()",
    "maxDate": "Date.now() + 365*24*60*60*1000"
  }
}
```

### 8. Date Picker

```json
{
  "birthDate": {
    "title": "Birth Date",
    "type": "string",
    "widget": "date",
    "displayFormat": "yyyy/MM/dd",
    "formatDate": "date",
    "mode": "date",
    "maxDate": "Date.now()",
    "minDate": "Date.now() - 100*365*24*60*60*1000"
  }
}
```

### 9. Time Picker

```json
{
  "openingTime": {
    "title": "Opening Time",
    "type": "string",
    "widget": "time",
    "displayFormat": "HH:mm:ss",
    "formatDate": "time",
    "min": "00:00:00",
    "max": "23:59:59",
    "field": "single",
    "mode": "time",
    "step": 900 // 15 minutes
  }
}
```

## Selection Fields

### 10. Radio Buttons

```json
{
  "gender": {
    "title": "Gender",
    "type": "string",
    "widget": "radio",
    "choices": "male:Male\nfemale:Female\nother:Other",
    "default": "male",
    "allowNull": true,
    "allowCustom": false,
    "layout": "horizontal"
  }
}
```

### 11. Select Dropdown

```json
{
  "country": {
    "title": "Country",
    "type": "string",
    "widget": "select",
    "choices": [
      {"key": "vn", "value": "Vietnam"},
      {"key": "us", "value": "United States"},
      {"key": "uk", "value": "United Kingdom"}
    ],
    "default": "vn",
    "allowNull": false,
    "isMultiple": false,
    "searchable": true
  }
}
```

### 12. Checkbox Group

```json
{
  "interests": {
    "title": "Interests",
    "type": "string",
    "widget": "checkbox",
    "choices": [
      {"key": "tech", "value": "Technology"},
      {"key": "sports", "value": "Sports"},
      {"key": "music", "value": "Music"},
      {"key": "travel", "value": "Travel"}
    ],
    "allowCustom": true,
    "returnValue": 2, // Return as array
    "layout": 0, // Vertical layout
    "toggleAll": true,
    "minSelection": 1,
    "maxSelection": 3
  }
}
```

### 13. Boolean Toggle

```json
{
  "isActive": {
    "title": "Active Status",
    "type": "string",
    "widget": "boolean",
    "appearance": "checkbox", // or "switch"
    "default": true,
    "trueLabel": "Active",
    "falseLabel": "Inactive"
  }
}
```

## Advanced Fields

### 14. Relation Field

```json
{
  "categoryId": {
    "title": "Category",
    "type": "string",
    "widget": "relation",
    "typeRelation": {
      "title": "Category",
      "entity": "categories",
      "type": "n-1",
      "displayField": "name",
      "valueField": "_id",
      "filter": {
        "combinator": "and",
        "rules": [
          {"field": "isActive", "operator": "eq", "value": true}
        ]
      },
      "searchFields": ["name", "description"],
      "createable": false
    }
  }
}
```

### 15. File Upload Fields

#### Single File

```json
{
  "avatar": {
    "title": "Profile Picture",
    "type": "string",
    "widget": "file",
    "meta": "Upload profile picture",
    "accept": "image/*",
    "maxSize": 5242880, // 5MB
    "preview": true
  }
}
```

#### Multiple Files

```json
{
  "attachments": {
    "title": "Attachments",
    "type": "string",
    "widget": "multipleFiles",
    "meta": "Upload documents",
    "accept": ".pdf,.doc,.docx",
    "maxFiles": 5,
    "maxSize": 10485760 // 10MB per file
  }
}
```

#### Responsive Images

```json
{
  "productImages": {
    "title": "Product Images",
    "type": "string",
    "widget": "multiImage",
    "fields": ["main", "mainMb", "thumbnail", "thumbnailMb"],
    "sizes": {
      "main": { "width": 1200, "height": 800 },
      "mainMb": { "width": 600, "height": 400 },
      "thumbnail": { "width": 300, "height": 200 },
      "thumbnailMb": { "width": 150, "height": 100 }
    }
  }
}
```

### 16. Condition Builder

```json
{
  "filterRules": {
    "title": "Filter Conditions",
    "type": "string",
    "widget": "condition",
    "typeUI": "filter",
    "fields": [
      {"name": "status", "type": "select", "options": ["active", "inactive"]},
      {"name": "price", "type": "number"},
      {"name": "category", "type": "relation"}
    ],
    "operators": ["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin"]
  }
}
```

### 17. Array Field

```json
{
  "specifications": {
    "title": "Product Specifications",
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "key": { "type": "string", "title": "Property" },
        "value": { "type": "string", "title": "Value" }
      }
    },
    "minItems": 1,
    "maxItems": 20,
    "addButton": "Add Specification",
    "removeButton": true,
    "sortable": true
  }
}
```

### 18. Special Fields

#### Data Widget

```json
{
  "metadata": {
    "title": "Metadata",
    "type": "string",
    "widget": "dataWidget",
    "dataType": "json",
    "syntax": "json",
    "height": 300
  }
}
```

#### Hyperlink

```json
{
  "website": {
    "title": "Website",
    "type": "string",
    "widget": "href",
    "hiddenTitle": false,
    "openInNewTab": true,
    "validateUrl": true
  }
}
```

#### Icon Selector

```json
{
  "icon": {
    "title": "Icon",
    "type": "string",
    "widget": "icon",
    "default": "AArrowDown",
    "iconSet": "lucide",
    "searchable": true
  }
}
```

#### Function Editor

```json
{
  "customFunction": {
    "title": "Custom Logic",
    "type": "string",
    "widget": "function",
    "language": "javascript",
    "theme": "monokai",
    "height": 400
  }
}
```

## Form Layout & UI

### Field Ordering

```json
{
  "ui": {
    "ui:order": [
      "title",
      "slug",
      "description",
      "category",
      "price",
      "status"
    ]
  }
}
```

### Field Grouping

```json
{
  "ui": {
    "ui:groups": [
      {
        "title": "Basic Information",
        "fields": ["title", "slug", "description"]
      },
      {
        "title": "Pricing",
        "fields": ["price", "comparePrice", "cost"]
      },
      {
        "title": "Inventory",
        "fields": ["sku", "stock", "trackInventory"]
      }
    ]
  }
}
```

### Conditional Display

```json
{
  "shippingAddress": {
    "title": "Shipping Address",
    "type": "object",
    "ui:hidden": "sameAsBilling === true",
    "properties": {
      "street": { "type": "string" },
      "city": { "type": "string" },
      "postalCode": { "type": "string" }
    }
  }
}
```

## Validation Rules

### Common Validators

```json
{
  "email": {
    "type": "string",
    "format": "email",
    "errorMessage": "Please enter a valid email"
  },
  "phone": {
    "type": "string",
    "pattern": "^\\+?[1-9]\\d{1,14}$",
    "errorMessage": "Invalid phone number"
  },
  "url": {
    "type": "string",
    "format": "uri",
    "pattern": "^https?://",
    "errorMessage": "URL must start with http:// or https://"
  }
}
```

### Custom Validation

```json
{
  "username": {
    "type": "string",
    "minLength": 3,
    "maxLength": 20,
    "pattern": "^[a-zA-Z0-9_]+$",
    "uniqueInDb": true,
    "errorMessages": {
      "minLength": "Username must be at least 3 characters",
      "pattern": "Username can only contain letters, numbers and underscore",
      "uniqueInDb": "This username is already taken"
    }
  }
}
```

### Cross-field Validation

```json
{
  "comparePrice": {
    "type": "number",
    "minimum": 0,
    "ui:validate": {
      "greaterThan": "price",
      "errorMessage": "Compare price must be greater than regular price"
    }
  }
}
```

## Best Practices

### 1. Field Naming

```json
// ✅ Good: Clear, consistent naming
{
  "firstName": { "title": "First Name" },
  "lastName": { "title": "Last Name" },
  "emailAddress": { "title": "Email Address" }
}

// ❌ Bad: Inconsistent naming
{
  "fname": { "title": "First Name" },
  "last_name": { "title": "Last Name" },
  "email-addr": { "title": "Email" }
}
```

### 2. Helpful Descriptions

```json
{
  "apiKey": {
    "title": "API Key",
    "type": "string",
    "widget": "password",
    "description": "Your secret API key. Keep this confidential!",
    "placeholder": "sk_live_...",
    "helpText": "Find your API key in Settings > API Keys"
  }
}
```

### 3. Progressive Disclosure

```json
{
  "advancedSettings": {
    "title": "Advanced Settings",
    "type": "object",
    "ui:collapsible": true,
    "ui:collapsed": true,
    "properties": {
      // Advanced fields here
    }
  }
}
```

### 4. Smart Defaults

```json
{
  "publishStatus": {
    "type": "string",
    "default": "draft",
    "enum": ["draft", "published", "archived"]
  },
  "publishDate": {
    "type": "string",
    "widget": "dateTime",
    "default": "Date.now()",
    "ui:disabled": "publishStatus !== 'published'"
  }
}
```

## Form Examples

### E-commerce Product Form

```json
{
  "properties": {
    "name": {
      "title": "Product Name",
      "type": "string",
      "widget": "shortAnswer",
      "maxLength": 200
    },
    "slug": {
      "title": "URL Slug",
      "type": "string",
      "widget": "UriKeyGen",
      "sourceField": "name"
    },
    "description": {
      "title": "Description",
      "type": "string",
      "widget": "textarea",
      "rows": 10
    },
    "price": {
      "title": "Price",
      "type": "string",
      "widget": "numberInput",
      "min": 0,
      "step": 0.01
    },
    "category": {
      "title": "Category",
      "type": "string",
      "widget": "relation",
      "typeRelation": {
        "entity": "categories",
        "type": "n-1"
      }
    },
    "images": {
      "title": "Product Images",
      "type": "string",
      "widget": "multiImage",
      "fields": ["main", "gallery"]
    },
    "status": {
      "title": "Status",
      "type": "string",
      "widget": "select",
      "choices": [
        {"key": "active", "value": "Active"},
        {"key": "inactive", "value": "Inactive"}
      ]
    }
  },
  "required": ["name", "price", "category"]
}
```

### User Registration Form

```json
{
  "properties": {
    "username": {
      "title": "Username",
      "type": "string",
      "widget": "shortAnswer",
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$"
    },
    "email": {
      "title": "Email",
      "type": "string",
      "widget": "shortAnswer",
      "format": "email"
    },
    "password": {
      "title": "Password",
      "type": "string",
      "widget": "password",
      "minLength": 8
    },
    "confirmPassword": {
      "title": "Confirm Password",
      "type": "string",
      "widget": "password",
      "ui:validate": {
        "match": "password"
      }
    },
    "profile": {
      "title": "Profile",
      "type": "object",
      "properties": {
        "firstName": {
          "title": "First Name",
          "type": "string"
        },
        "lastName": {
          "title": "Last Name",
          "type": "string"
        },
        "birthDate": {
          "title": "Birth Date",
          "type": "string",
          "widget": "date"
        }
      }
    },
    "agreeToTerms": {
      "title": "I agree to the Terms and Conditions",
      "type": "string",
      "widget": "boolean",
      "default": false,
      "ui:validate": {
        "const": true,
        "errorMessage": "You must agree to the terms"
      }
    }
  },
  "required": ["username", "email", "password", "agreeToTerms"]
}
```

## Summary

Form Schema trong MongoREST cung cấp:

1. **Rich Widgets**: 20+ field types cho mọi use case
2. **Validation**: Built-in và custom validators
3. **UI Control**: Layout, grouping, conditional display
4. **Extensibility**: Custom widgets và validators
5. **User-Friendly**: Clear labels, help text, error messages

Next: [API Reference →](/docs/api-reference/basic-queries)
