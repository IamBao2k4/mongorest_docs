---
sidebar_position: 1
---

# Schema Structure Introduction

Hướng dẫn từ cơ bản đến nâng cao về cấu trúc Schema trong MongoREST với các ví dụ thực tế.

## Tổng quan

Schema trong MongoREST là JSON Schema mở rộng để:
- Định nghĩa cấu trúc dữ liệu MongoDB collections
- Thiết lập relationships giữa các collections
- Cấu hình validation rules và permissions
- Quản lý indexes và các tính năng đặc biệt

## 1. Schema Cơ Bản - User Entity

### 1.1 User Schema Tối Giản

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "collection": "user",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "widget": "text"
    },
    "email": {
      "type": "string",
      "format": "email",
      "widget": "email"
    }
  },
  "required": ["name", "email"]
}
```

### 1.2 User Schema Đầy Đủ với UI Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User Management",
  "description": "Schema for user account management system",
  "collection": "user",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100,
      "description": "Full name of user"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User email address"
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 30,
      "pattern": "^[a-zA-Z0-9_]+$"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "description": "Encrypted password"
    },
    "phone": {
      "type": ["string", "null"],
      "pattern": "^\\+?[1-9]\\d{1,14}$"
    },
    "avatar": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "birthDate": {
      "type": ["string", "null"],
      "format": "date"
    },
    "gender": {
      "type": "string",
      "enum": ["male", "female", "other"],
      "default": "other"
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "banned", "pending"],
      "default": "pending"
    },
    "emailVerified": {
      "type": "boolean",
      "default": false
    },
    "lastLogin": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "bio": {
      "type": ["string", "null"],
      "maxLength": 1000
    },
    "preferences": {
      "type": "object",
      "properties": {
        "language": {
          "type": "string",
          "enum": ["en", "vi", "ja"],
          "default": "en"
        },
        "notifications": {
          "type": "object",
          "properties": {
            "email": { "type": "boolean", "default": true },
            "push": { "type": "boolean", "default": true },
            "sms": { "type": "boolean", "default": false }
          }
        }
      }
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zipCode": { "type": "string", "pattern": "^\\d{5}(-\\d{4})?$" },
        "country": { "type": "string", "default": "VN" }
      }
    },
    "socialLinks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "platform": {
            "type": "string",
            "enum": ["facebook", "twitter", "linkedin", "instagram"]
          },
          "url": { "type": "string", "format": "uri" }
        },
        "required": ["platform", "url"]
      }
    }
  },
  "required": ["name", "email", "username", "password"],
  "additionalProperties": false,
  "ui_schema": {
    "name": {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "Your display name on the platform"
    },
    "email": {
      "ui:widget": "email",
      "ui:placeholder": "user@example.com",
      "ui:help": "We'll never share your email"
    },
    "username": {
      "ui:widget": "text",
      "ui:placeholder": "unique_username",
      "ui:help": "Must be unique, 3-30 characters"
    },
    "password": {
      "ui:widget": "password",
      "ui:placeholder": "Enter secure password",
      "ui:help": "Minimum 8 characters"
    },
    "phone": {
      "ui:widget": "tel",
      "ui:placeholder": "+1234567890",
      "ui:help": "Include country code"
    },
    "avatar": {
      "ui:widget": "file",
      "ui:options": {
        "accept": "image/*",
        "filePreview": true
      }
    },
    "birthDate": {
      "ui:widget": "date",
      "ui:help": "Used for age verification"
    },
    "gender": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "status": {
      "ui:widget": "select",
      "ui:help": "Account status"
    },
    "emailVerified": {
      "ui:widget": "checkbox",
      "ui:help": "Email verification status"
    },
    "lastLogin": {
      "ui:widget": "datetime",
      "ui:readonly": true
    },
    "bio": {
      "ui:widget": "textarea",
      "ui:placeholder": "Tell us about yourself...",
      "ui:options": {
        "rows": 4
      }
    },
    "preferences": {
      "language": {
        "ui:widget": "select",
        "ui:help": "Preferred language"
      },
      "notifications": {
        "ui:widget": "fieldset",
        "ui:title": "Notification Preferences",
        "email": {
          "ui:widget": "checkbox",
          "ui:title": "Email notifications"
        },
        "push": {
          "ui:widget": "checkbox", 
          "ui:title": "Push notifications"
        },
        "sms": {
          "ui:widget": "checkbox",
          "ui:title": "SMS notifications"
        }
      }
    },
    "address": {
      "ui:widget": "fieldset",
      "ui:title": "Address Information",
      "street": {
        "ui:widget": "text",
        "ui:placeholder": "123 Main Street"
      },
      "city": {
        "ui:widget": "text",
        "ui:placeholder": "Ho Chi Minh City"
      },
      "state": {
        "ui:widget": "text",
        "ui:placeholder": "Ho Chi Minh"
      },
      "zipCode": {
        "ui:widget": "text",
        "ui:placeholder": "70000"
      },
      "country": {
        "ui:widget": "select",
        "ui:options": {
          "enumOptions": [
            { "value": "VN", "label": "Vietnam" },
            { "value": "US", "label": "United States" },
            { "value": "JP", "label": "Japan" }
          ]
        }
      }
    },
    "socialLinks": {
      "ui:widget": "array",
      "ui:title": "Social Media Links",
      "ui:options": {
        "addable": true,
        "removable": true,
        "orderable": true
      },
      "items": {
        "platform": {
          "ui:widget": "select"
        },
        "url": {
          "ui:widget": "url",
          "ui:placeholder": "https://facebook.com/username"
        }
      }
    }
  }
}
```

## 2. Schema Trung Bình - Product Entity

### 2.1 Product Schema Cơ Bản

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product",
  "collection": "product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "categoryId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    }
  },
  "required": ["name", "price"],
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "category",
      "localField": "categoryId",
      "foreignField": "_id"
    }
  }
}
```

### 2.2 Product Schema Nâng Cao với UI Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product Catalog",
  "description": "Complete e-commerce product schema",
  "collection": "product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Product name"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "URL-friendly product identifier"
    },
    "description": {
      "type": "string",
      "maxLength": 5000,
      "description": "Detailed product description"
    },
    "shortDescription": {
      "type": "string",
      "maxLength": 500,
      "description": "Brief product summary"
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 0.01,
      "description": "Current selling price"
    },
    "comparePrice": {
      "type": ["number", "null"],
      "minimum": 0,
      "description": "Original price for comparison"
    },
    "costPrice": {
      "type": ["number", "null"],
      "minimum": 0,
      "description": "Cost price for internal use"
    },
    "sku": {
      "type": "string",
      "pattern": "^[A-Z0-9-]+$",
      "description": "Stock Keeping Unit"
    },
    "barcode": {
      "type": ["string", "null"],
      "description": "Product barcode"
    },
    "weight": {
      "type": ["number", "null"],
      "minimum": 0,
      "description": "Product weight in grams"
    },
    "dimensions": {
      "type": "object",
      "properties": {
        "length": { "type": "number", "minimum": 0 },
        "width": { "type": "number", "minimum": 0 },
        "height": { "type": "number", "minimum": 0 },
        "unit": { "type": "string", "enum": ["cm", "in"], "default": "cm" }
      }
    },
    "inventory": {
      "type": "object",
      "properties": {
        "quantity": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "lowStockThreshold": {
          "type": "integer",
          "minimum": 0,
          "default": 10
        },
        "trackQuantity": {
          "type": "boolean",
          "default": true
        },
        "allowBackorders": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "status": {
      "type": "string",
      "enum": ["draft", "active", "inactive", "discontinued"],
      "default": "draft"
    },
    "featured": {
      "type": "boolean",
      "default": false
    },
    "categoryId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "brandId": {
      "type": ["string", "null"],
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true,
      "maxItems": 20
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri" },
          "alt": { "type": "string" },
          "position": { "type": "integer", "minimum": 0 },
          "isPrimary": { "type": "boolean", "default": false }
        },
        "required": ["url"]
      },
      "maxItems": 10
    },
    "variants": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "sku": { "type": "string" },
          "price": { "type": "number", "minimum": 0 },
          "quantity": { "type": "integer", "minimum": 0 },
          "options": {
            "type": "object",
            "properties": {
              "size": { "type": "string" },
              "color": { "type": "string" },
              "material": { "type": "string" }
            }
          }
        },
        "required": ["name", "sku", "price"]
      }
    },
    "seo": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "maxLength": 60 },
        "description": { "type": "string", "maxLength": 160 },
        "keywords": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "customFields": {
      "type": "object",
      "additionalProperties": true,
      "description": "Custom fields for specific business needs"
    }
  },
  "required": ["name", "price", "sku"],
  "additionalProperties": false,
  "ui_schema": {
    "name": {
      "ui:widget": "text",
      "ui:placeholder": "Product name",
      "ui:autofocus": true
    },
    "slug": {
      "ui:widget": "text",
      "ui:placeholder": "product-slug",
      "ui:help": "Auto-generated from name if empty"
    },
    "description": {
      "ui:widget": "richtext",
      "ui:options": {
        "toolbar": ["bold", "italic", "underline", "link", "image", "list"]
      }
    },
    "shortDescription": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 3
      },
      "ui:placeholder": "Brief product summary for listings"
    },
    "price": {
      "ui:widget": "money",
      "ui:options": {
        "currency": "USD",
        "currencyDisplay": "symbol"
      }
    },
    "comparePrice": {
      "ui:widget": "money",
      "ui:options": {
        "currency": "USD"
      },
      "ui:help": "Original price for comparison"
    },
    "costPrice": {
      "ui:widget": "money",
      "ui:options": {
        "currency": "USD"
      },
      "ui:help": "Internal cost price"
    },
    "sku": {
      "ui:widget": "text",
      "ui:placeholder": "PROD-001",
      "ui:help": "Unique product identifier"
    },
    "barcode": {
      "ui:widget": "text",
      "ui:placeholder": "1234567890123"
    },
    "weight": {
      "ui:widget": "number",
      "ui:placeholder": "0",
      "ui:help": "Weight in grams"
    },
    "dimensions": {
      "ui:widget": "fieldset",
      "ui:title": "Product Dimensions",
      "length": {
        "ui:widget": "number",
        "ui:placeholder": "0"
      },
      "width": {
        "ui:widget": "number", 
        "ui:placeholder": "0"
      },
      "height": {
        "ui:widget": "number",
        "ui:placeholder": "0"
      },
      "unit": {
        "ui:widget": "radio",
        "ui:options": {
          "inline": true
        }
      }
    },
    "inventory": {
      "ui:widget": "fieldset",
      "ui:title": "Inventory Management",
      "quantity": {
        "ui:widget": "number",
        "ui:placeholder": "0"
      },
      "lowStockThreshold": {
        "ui:widget": "number",
        "ui:help": "Alert when stock goes below this number"
      },
      "trackQuantity": {
        "ui:widget": "checkbox",
        "ui:title": "Track inventory quantity"
      },
      "allowBackorders": {
        "ui:widget": "checkbox",
        "ui:title": "Allow backorders when out of stock"
      }
    },
    "status": {
      "ui:widget": "select",
      "ui:options": {
        "enumOptions": [
          { "value": "draft", "label": "Draft" },
          { "value": "active", "label": "Active" },
          { "value": "inactive", "label": "Inactive" },
          { "value": "discontinued", "label": "Discontinued" }
        ]
      }
    },
    "featured": {
      "ui:widget": "checkbox",
      "ui:title": "Featured product"
    },
    "categoryId": {
      "ui:widget": "select",
      "ui:options": {
        "async": true,
        "endpoint": "/api/categories",
        "valueField": "_id",
        "labelField": "name"
      }
    },
    "brandId": {
      "ui:widget": "select",
      "ui:options": {
        "async": true,
        "endpoint": "/api/brands",
        "valueField": "_id", 
        "labelField": "name",
        "allowEmpty": true
      }
    },
    "tags": {
      "ui:widget": "tags",
      "ui:options": {
        "suggestions": true,
        "endpoint": "/api/tags/suggestions"
      }
    },
    "images": {
      "ui:widget": "image-gallery",
      "ui:title": "Product Images",
      "ui:options": {
        "accept": "image/*",
        "multiple": true,
        "maxFiles": 10,
        "dragDrop": true,
        "preview": true
      },
      "items": {
        "url": {
          "ui:widget": "hidden"
        },
        "alt": {
          "ui:widget": "text",
          "ui:placeholder": "Image description"
        },
        "position": {
          "ui:widget": "number"
        },
        "isPrimary": {
          "ui:widget": "radio",
          "ui:title": "Primary image"
        }
      }
    },
    "variants": {
      "ui:widget": "variant-builder",
      "ui:title": "Product Variants",
      "ui:options": {
        "addable": true,
        "removable": true,
        "orderable": true
      },
      "items": {
        "name": {
          "ui:widget": "text",
          "ui:placeholder": "Variant name"
        },
        "sku": {
          "ui:widget": "text",
          "ui:placeholder": "VAR-001"
        },
        "price": {
          "ui:widget": "money"
        },
        "quantity": {
          "ui:widget": "number"
        },
        "options": {
          "ui:widget": "object",
          "size": {
            "ui:widget": "select",
            "ui:options": {
              "enumOptions": [
                { "value": "XS", "label": "Extra Small" },
                { "value": "S", "label": "Small" },
                { "value": "M", "label": "Medium" },
                { "value": "L", "label": "Large" },
                { "value": "XL", "label": "Extra Large" }
              ]
            }
          },
          "color": {
            "ui:widget": "color"
          },
          "material": {
            "ui:widget": "text"
          }
        }
      }
    },
    "seo": {
      "ui:widget": "fieldset",
      "ui:title": "SEO Settings",
      "ui:options": {
        "collapsible": true,
        "collapsed": true
      },
      "title": {
        "ui:widget": "text",
        "ui:placeholder": "SEO title (max 60 chars)",
        "ui:help": "Leave empty to auto-generate from product name"
      },
      "description": {
        "ui:widget": "textarea",
        "ui:placeholder": "SEO description (max 160 chars)",
        "ui:options": {
          "rows": 3
        }
      },
      "keywords": {
        "ui:widget": "tags",
        "ui:placeholder": "Add SEO keywords"
      }
    },
    "customFields": {
      "ui:widget": "key-value",
      "ui:title": "Custom Fields",
      "ui:options": {
        "addable": true,
        "removable": true
      }
    }
  },
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "category",
      "localField": "categoryId",
      "foreignField": "_id",
      "required": true
    },
    "brand": {
      "type": "belongsTo",
      "collection": "brand",
      "localField": "brandId",
      "foreignField": "_id"
    },
    "reviews": {
      "type": "hasMany",
      "collection": "product_review",
      "localField": "_id",
      "foreignField": "productId",
      "defaultSort": { "rating": -1, "createdAt": -1 },
      "defaultFilters": { "status": "approved" }
    },
    "relatedProducts": {
      "type": "manyToMany",
      "collection": "product",
      "through": "product_relations",
      "localField": "_id",
      "throughLocalField": "productId",
      "throughForeignField": "relatedProductId",
      "foreignField": "_id"
    }
  }
}
```

## 3. Schema Nâng Cao - Category với Nested Structure

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Category Management",
  "description": "Hierarchical category structure with advanced features",
  "collection": "category",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "description": {
      "type": ["string", "null"],
      "maxLength": 1000
    },
    "parentId": {
      "type": ["string", "null"],
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "level": {
      "type": "integer",
      "minimum": 0,
      "maximum": 5,
      "default": 0
    },
    "path": {
      "type": "string",
      "description": "Hierarchical path like '/electronics/computers/laptops'"
    },
    "position": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "icon": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "image": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "isVisible": {
      "type": "boolean",
      "default": true
    },
    "metadata": {
      "type": "object",
      "properties": {
        "productCount": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "childrenCount": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        }
      }
    },
    "seo": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" },
        "keywords": { "type": "array", "items": { "type": "string" } }
      }
    }
  },
  "required": ["name", "slug"],
  "relationships": {
    "parent": {
      "type": "belongsTo",
      "collection": "category",
      "localField": "parentId",
      "foreignField": "_id"
    },
    "children": {
      "type": "hasMany",
      "collection": "category",
      "localField": "_id",
      "foreignField": "parentId",
      "defaultSort": { "position": 1, "name": 1 }
    },
    "products": {
      "type": "hasMany",
      "collection": "product",
      "localField": "_id",
      "foreignField": "categoryId",
      "defaultFilters": { "status": "active" }
    }
  }
}
```

## 4. Schema với Conditional Logic - Order Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Order Management",
  "collection": "order",
  "type": "object",
  "properties": {
    "orderNumber": {
      "type": "string",
      "pattern": "^ORD-\\d{8}-\\d{4}$"
    },
    "customerId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]
    },
    "paymentMethod": {
      "type": "string",
      "enum": ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"]
    },
    "shippingMethod": {
      "type": "string",
      "enum": ["standard", "express", "overnight", "pickup"]
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "paymentMethod": { "const": "credit_card" } }
      },
      "then": {
        "properties": {
          "creditCard": {
            "type": "object",
            "properties": {
              "last4": { "type": "string", "pattern": "^\\d{4}$" },
              "brand": { "type": "string" },
              "expiryMonth": { "type": "integer", "minimum": 1, "maximum": 12 },
              "expiryYear": { "type": "integer" }
            },
            "required": ["last4", "brand"]
          }
        },
        "required": ["creditCard"]
      }
    },
    {
      "if": {
        "properties": { "paymentMethod": { "const": "paypal" } }
      },
      "then": {
        "properties": {
          "paypalEmail": {
            "type": "string",
            "format": "email"
          }
        },
        "required": ["paypalEmail"]
      }
    }
  ],
  "relationships": {
    "customer": {
      "type": "belongsTo",
      "collection": "user",
      "localField": "customerId",
      "foreignField": "_id"
    },
    "items": {
      "type": "hasMany",
      "collection": "order_item",
      "localField": "_id",
      "foreignField": "orderId"
    }
  }
}
```

## 5. Schema với Multiple Relationships - Blog Post

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Blog Post",
  "collection": "post",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "content": {
      "type": "string",
      "minLength": 1
    },
    "excerpt": {
      "type": ["string", "null"],
      "maxLength": 300
    },
    "authorId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "categoryIds": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[0-9a-fA-F]{24}$"
      },
      "minItems": 1,
      "maxItems": 5
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published", "scheduled", "archived"],
      "default": "draft"
    },
    "publishedAt": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "featuredImage": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "viewCount": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "allowComments": {
      "type": "boolean",
      "default": true
    }
  },
  "required": ["title", "content", "authorId"],
  "relationships": {
    "author": {
      "type": "belongsTo",
      "collection": "user",
      "localField": "authorId",
      "foreignField": "_id"
    },
    "categories": {
      "type": "manyToMany",
      "collection": "category",
      "through": "post_categories",
      "localField": "_id",
      "throughLocalField": "postId",
      "throughForeignField": "categoryId",
      "foreignField": "_id"
    },
    "comments": {
      "type": "hasMany",
      "collection": "comment",
      "localField": "_id",
      "foreignField": "postId",
      "defaultFilters": { "approved": true },
      "defaultSort": { "createdAt": -1 }
    },
    "likes": {
      "type": "hasMany",
      "collection": "post_like",
      "localField": "_id",
      "foreignField": "postId"
    }
  }
}
```

## 6. Widget Types & UI Schema Reference

### 6.1 Basic Input Widgets
```json
{
  "ui_schema": {
    "textField": {
      "ui:widget": "text",
      "ui:placeholder": "Enter text",
      "ui:help": "Helper text"
    },
    "emailField": {
      "ui:widget": "email",
      "ui:placeholder": "user@example.com"
    },
    "passwordField": {
      "ui:widget": "password",
      "ui:placeholder": "Enter password"
    },
    "numberField": {
      "ui:widget": "number",
      "ui:placeholder": "0"
    },
    "textareaField": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 4
      }
    }
  }
}
```

### 6.2 Selection Widgets
```json
{
  "ui_schema": {
    "selectField": {
      "ui:widget": "select",
      "ui:options": {
        "enumOptions": [
          { "value": "option1", "label": "Option 1" },
          { "value": "option2", "label": "Option 2" }
        ]
      }
    },
    "radioField": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "checkboxField": {
      "ui:widget": "checkbox",
      "ui:title": "Check this option"
    },
    "multiSelectField": {
      "ui:widget": "checkboxes",
      "ui:options": {
        "inline": false
      }
    }
  }
}
```

### 6.3 Advanced Widgets
```json
{
  "ui_schema": {
    "dateField": {
      "ui:widget": "date",
      "ui:options": {
        "format": "YYYY-MM-DD"
      }
    },
    "dateTimeField": {
      "ui:widget": "datetime",
      "ui:options": {
        "format": "YYYY-MM-DD HH:mm:ss"
      }
    },
    "colorField": {
      "ui:widget": "color",
      "ui:options": {
        "format": "hex"
      }
    },
    "fileField": {
      "ui:widget": "file",
      "ui:options": {
        "accept": "image/*",
        "filePreview": true
      }
    },
    "richTextField": {
      "ui:widget": "richtext",
      "ui:options": {
        "toolbar": ["bold", "italic", "link", "image"],
        "height": 300
      }
    }
  }
}
```

### 6.4 Specialized E-commerce Widgets
```json
{
  "ui_schema": {
    "priceField": {
      "ui:widget": "money",
      "ui:options": {
        "currency": "USD",
        "currencyDisplay": "symbol"
      }
    },
    "tagsField": {
      "ui:widget": "tags",
      "ui:options": {
        "suggestions": true,
        "endpoint": "/api/tags/suggestions"
      }
    },
    "imageGallery": {
      "ui:widget": "image-gallery",
      "ui:options": {
        "accept": "image/*",
        "multiple": true,
        "maxFiles": 10,
        "dragDrop": true
      }
    },
    "variantBuilder": {
      "ui:widget": "variant-builder",
      "ui:options": {
        "optionTypes": ["size", "color", "material"]
      }
    }
  }
}
```

### 6.5 Layout & Organization Widgets
```json
{
  "ui_schema": {
    "fieldsetGroup": {
      "ui:widget": "fieldset",
      "ui:title": "Group Title",
      "ui:options": {
        "collapsible": true,
        "collapsed": false
      }
    },
    "tabsLayout": {
      "ui:widget": "tabs",
      "ui:options": {
        "tabs": [
          { "title": "Basic Info", "fields": ["name", "description"] },
          { "title": "Pricing", "fields": ["price", "comparePrice"] }
        ]
      }
    },
    "gridLayout": {
      "ui:widget": "grid",
      "ui:options": {
        "columns": 2,
        "gap": "16px"
      }
    }
  }
}
```

### 6.6 Relationship Widgets
```json
{
  "ui_schema": {
    "asyncSelect": {
      "ui:widget": "select",
      "ui:options": {
        "async": true,
        "endpoint": "/api/categories",
        "valueField": "_id",
        "labelField": "name",
        "searchable": true
      }
    },
    "multiRelation": {
      "ui:widget": "multi-select",
      "ui:options": {
        "async": true,
        "endpoint": "/api/tags",
        "valueField": "_id",
        "labelField": "name"
      }
    }
  }
}
```

## 6.7 Naming Conventions
```json
{
  "properties": {
    "firstName": { "type": "string" },
    "lastName": { "type": "string" },
    "emailAddress": { "type": "string", "format": "email" },
    "phoneNumber": { "type": "string" },
    "dateOfBirth": { "type": "string", "format": "date" },
    "isActive": { "type": "boolean" },
    "hasPermission": { "type": "boolean" },
    "canEdit": { "type": "boolean" }
  }
}
```

### 6.8 Validation Patterns
```json
{
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    },
    "phone": {
      "type": "string",
      "pattern": "^\\+?[1-9]\\d{1,14}$"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "objectId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    }
  }
}
```

### 6.3 Default Values và Enums

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": ["user", "admin", "moderator"],
      "default": "user"
    },
    "language": {
      "type": "string",
      "enum": ["en", "vi", "ja", "ko"],
      "default": "en"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "default": "Date.now()"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published", "archived"],
      "default": "draft"
    }
  }
}
```

### 6.4 Advanced Validation Patterns

#### Complex Conditional Validation
```json
{
  "type": "object",
  "properties": {
    "userType": {
      "type": "string",
      "enum": ["individual", "business"]
    },
    "businessInfo": {
      "type": "object",
      "properties": {
        "companyName": { "type": "string" },
        "taxId": { "type": "string" },
        "businessLicense": { "type": "string" }
      }
    },
    "personalInfo": {
      "type": "object", 
      "properties": {
        "firstName": { "type": "string" },
        "lastName": { "type": "string" },
        "idNumber": { "type": "string" }
      }
    }
  },
  "if": { "properties": { "userType": { "const": "business" } } },
  "then": {
    "required": ["businessInfo"],
    "properties": {
      "businessInfo": { "required": ["companyName", "taxId"] }
    }
  },
  "else": {
    "required": ["personalInfo"],
    "properties": {
      "personalInfo": { "required": ["firstName", "lastName"] }
    }
  }
}
```

#### Real-world E-commerce Validation
```json
{
  "type": "object",
  "properties": {
    "productType": {
      "type": "string",
      "enum": ["physical", "digital", "service"]
    },
    "weight": { "type": "number", "minimum": 0 },
    "dimensions": {
      "type": "object",
      "properties": {
        "length": { "type": "number", "minimum": 0 },
        "width": { "type": "number", "minimum": 0 },
        "height": { "type": "number", "minimum": 0 }
      }
    },
    "downloadUrl": { "type": "string", "format": "uri" },
    "serviceArea": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "allOf": [
    {
      "if": { "properties": { "productType": { "const": "physical" } } },
      "then": { "required": ["weight", "dimensions"] }
    },
    {
      "if": { "properties": { "productType": { "const": "digital" } } },
      "then": { "required": ["downloadUrl"] }
    },
    {
      "if": { "properties": { "productType": { "const": "service" } } },
      "then": { "required": ["serviceArea"] }
    }
  ]
}
```

### 6.5 Performance & Indexing Hints

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "_index": { "unique": true, "sparse": true }
    },
    "username": {
      "type": "string",
      "_index": { "unique": true }
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive"],
      "_index": true
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "_index": { "order": -1 }
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "_index": "text"
    },
    "location": {
      "type": "object",
      "properties": {
        "coordinates": {
          "type": "array",
          "items": { "type": "number" }
        }
      },
      "_index": "2dsphere"
    }
  }
}
```

### 6.6 Naming Conventions
```json
{
  "properties": {
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "pending", "banned"],
      "default": "pending"
    },
    "role": {
      "type": "string",
      "enum": ["user", "admin", "moderator"],
      "default": "user"
    },
    "language": {
      "type": "string",
      "enum": ["en", "vi", "ja", "ko"],
      "default": "en"
    }
  }
}
```

### 6.9 UI Schema Best Practices

#### Widget Selection Guidelines
```json
{
  "ui_schema": {
    // Use appropriate input types
    "email": { "ui:widget": "email" },        // Better than "text"
    "password": { "ui:widget": "password" },  // Security
    "url": { "ui:widget": "url" },           // Validation
    "phone": { "ui:widget": "tel" },         // Mobile-friendly
    
    // Large text content
    "description": {
      "ui:widget": "textarea",
      "ui:options": { "rows": 4 }
    },
    "content": {
      "ui:widget": "richtext",               // HTML editor
      "ui:options": { "toolbar": "full" }
    },
    
    // Enums based on count
    "status": {
      "ui:widget": "radio",                  // <= 5 options
      "ui:options": { "inline": true }
    },
    "country": {
      "ui:widget": "select",                 // > 5 options
      "ui:options": { "searchable": true }
    },
    
    // Arrays based on type
    "tags": {
      "ui:widget": "tags",                   // Simple string array
      "ui:options": { "allowNew": true }
    },
    "attachments": {
      "ui:widget": "array",                  // Complex object array
      "ui:options": { "orderable": true }
    }
  }
}
```

#### User Experience Considerations
```json
{
  "ui_schema": {
    "price": {
      "ui:widget": "number",
      "ui:placeholder": "0.00",
      "ui:help": "Enter price in USD",
      "ui:options": {
        "step": 0.01,
        "min": 0,
        "inputType": "number"
      }
    },
    "category": {
      "ui:widget": "select",
      "ui:placeholder": "Choose category...",
      "ui:help": "Select the most relevant category",
      "ui:options": {
        "searchable": true,
        "clearable": true
      }
    },
    "featured": {
      "ui:widget": "checkbox",
      "ui:title": "Feature this product",
      "ui:help": "Featured products appear on homepage"
    }
  }
}
```

## 8. API Query Parameters & Usage

### 8.1 Filtering & Query Operators

MongoREST hỗ trợ rich query parameters để filter, sort, và paginate data:

#### Basic Filtering
```bash
# Exact match
GET /api/user?name=eq.John
GET /api/product?status=eq.active

# Comparison operators
GET /api/user?age=gte.18          # greater than or equal
GET /api/user?age=lt.65           # less than
GET /api/product?price=gte.100    # price >= 100
GET /api/product?price=lt.500     # price < 500

# Text operators
GET /api/user?name=like.*john*    # contains 'john'
GET /api/user?email=ilike.*@gmail.com*  # case-insensitive
GET /api/product?name=starts.iPhone     # starts with 'iPhone'
```

#### Array & Object Filtering
```bash
# Array contains
GET /api/user?tags=cs.{tech,programming}  # contains 'tech' or 'programming'
GET /api/product?categories=cs.{electronics}

# JSON/Object field filtering
GET /api/user?preferences->>language=eq.en
GET /api/user?address->>city=eq.Hanoi
```

#### Null/Not Null
```bash
GET /api/user?avatar=is.null      # avatar is null
GET /api/user?avatar=not.is.null  # avatar is not null
```

### 8.2 Relationships & Embedding

```bash
# Include related data
GET /api/user?select=*,orders(*)        # user with all orders
GET /api/order?select=*,user(name,email) # order with user name & email
GET /api/product?select=*,category(name),reviews(rating,comment)

# Filter by relationship
GET /api/order?user.status=eq.active    # orders from active users
GET /api/product?category.name=eq.Electronics
```

### 8.3 Sorting & Pagination

```bash
# Sorting
GET /api/user?order=name.asc        # sort by name ascending
GET /api/user?order=createdAt.desc  # sort by creation date descending
GET /api/product?order=price.asc,name.desc  # multiple sort fields

# Pagination
GET /api/user?limit=10&offset=20    # page 3 (20 records skip, 10 per page)
GET /api/user?page=3&per_page=10    # alternative pagination syntax
```

### 8.4 Advanced Queries

```bash
# Complex conditions with AND/OR
GET /api/user?and=(status.eq.active,age.gte.18)
GET /api/product?or=(category.eq.electronics,price.lt.100)

# Range queries
GET /api/order?createdAt=gte.2024-01-01&createdAt=lt.2024-02-01
GET /api/product?price=gte.100&price=lte.500

# Full-text search (if enabled)
GET /api/product?search=fts.smartphone&search_lang=english
```

### 8.5 Select & Projection

```bash
# Select specific fields
GET /api/user?select=name,email,createdAt
GET /api/product?select=name,price,category(name)

# Exclude fields
GET /api/user?select=*&exclude=password,internalNotes

# Count only
GET /api/user?select=count()
GET /api/order?select=count()&status=eq.completed
```

### 8.6 Schema-Based Query Examples

Based on our User and Product schemas:

```bash
# User queries
GET /api/user?status=eq.active&emailVerified=eq.true
GET /api/user?preferences->>language=eq.vi
GET /api/user?address->>country=eq.VN
GET /api/user?socialLinks=cs.{facebook}

# Product queries  
GET /api/product?category.name=eq.Electronics
GET /api/product?price=gte.100&price=lte.500
GET /api/product?tags=cs.{smartphone,android}
GET /api/product?inStock=eq.true&status=eq.active

# Order queries
GET /api/order?user.status=eq.active
GET /api/order?items.product.category.name=eq.Electronics
GET /api/order?createdAt=gte.2024-01-01&status=eq.completed
```

## Tổng kết

Schema trong MongoREST cung cấp:

1. **Validation mạnh mẽ**: JSON Schema validation + MongoDB validation
2. **Relationships linh hoạt**: belongsTo, hasMany, manyToMany
3. **Conditional logic**: if/then/else cho business rules phức tạp
4. **Type safety**: Strict typing với comprehensive validation
5. **Performance**: Built-in indexing và query optimization

Next: [Detailed Schema Structure →](./schema-structure)

## 6.10 Practical Widget Examples

#### Complete Form Example - User Registration
```json
{
  "type": "object",
  "properties": {
    "personalInfo": {
      "type": "object",
      "properties": {
        "firstName": { "type": "string", "minLength": 1 },
        "lastName": { "type": "string", "minLength": 1 },
        "email": { "type": "string", "format": "email" },
        "phone": { "type": "string", "pattern": "^\\+?[1-9]\\d{1,14}$" }
      }
    },
    "preferences": {
      "type": "object",
      "properties": {
        "newsletter": { "type": "boolean", "default": true },
        "notifications": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["email", "sms", "push"]
          }
        },
        "language": {
          "type": "string",
          "enum": ["en", "vi", "ja"],
          "default": "en"
        }
      }
    }
  },
  "ui_schema": {
    "ui:order": ["personalInfo", "preferences"],
    "personalInfo": {
      "ui:widget": "fieldset",
      "ui:title": "Personal Information",
      "ui:description": "Please provide your basic information",
      "firstName": {
        "ui:widget": "text",
        "ui:placeholder": "Enter first name",
        "ui:autofocus": true
      },
      "lastName": {
        "ui:widget": "text",
        "ui:placeholder": "Enter last name"
      },
      "email": {
        "ui:widget": "email",
        "ui:placeholder": "your@email.com",
        "ui:help": "We'll send verification to this email"
      },
      "phone": {
        "ui:widget": "tel",
        "ui:placeholder": "+1 (555) 123-4567",
        "ui:options": {
          "inputType": "tel"
        }
      }
    },
    "preferences": {
      "ui:widget": "fieldset",
      "ui:title": "Preferences",
      "newsletter": {
        "ui:widget": "checkbox",
        "ui:title": "Subscribe to newsletter",
        "ui:help": "Get updates about new features"
      },
      "notifications": {
        "ui:widget": "checkboxes",
        "ui:title": "Notification methods",
        "ui:options": {
          "inline": true,
          "enumNames": ["Email", "SMS", "Push notifications"]
        }
      },
      "language": {
        "ui:widget": "select",
        "ui:title": "Preferred language",
        "ui:options": {
          "enumNames": ["English", "Tiếng Việt", "日本語"]
        }
      }
    }
  }
}
```

#### E-commerce Product Form
```json
{
  "type": "object",
  "properties": {
    "basic": {
      "type": "object",
      "properties": {
        "name": { "type": "string", "maxLength": 200 },
        "description": { "type": "string", "maxLength": 5000 },
        "category": { "type": "string" },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "pricing": {
      "type": "object", 
      "properties": {
        "price": { "type": "number", "minimum": 0 },
        "comparePrice": { "type": "number", "minimum": 0 },
        "currency": { "type": "string", "enum": ["USD", "EUR", "VND"] }
      }
    },
    "inventory": {
      "type": "object",
      "properties": {
        "sku": { "type": "string" },
        "quantity": { "type": "integer", "minimum": 0 },
        "trackInventory": { "type": "boolean", "default": true }
      }
    }
  },
  "ui_schema": {
    "ui:layout": "tabs",
    "basic": {
      "ui:title": "Basic Information",
      "ui:icon": "info",
      "name": {
        "ui:widget": "text",
        "ui:placeholder": "Product name",
        "ui:autofocus": true
      },
      "description": {
        "ui:widget": "richtext",
        "ui:options": {
          "toolbar": ["bold", "italic", "link", "bulletList"],
          "placeholder": "Describe your product..."
        }
      },
      "category": {
        "ui:widget": "autocomplete",
        "ui:options": {
          "dataSource": "/api/categories",
          "valueField": "_id",
          "labelField": "name",
          "searchable": true
        }
      },
      "tags": {
        "ui:widget": "tags",
        "ui:options": {
          "allowNew": true,
          "suggestions": ["featured", "new", "sale", "popular"]
        }
      }
    },
    "pricing": {
      "ui:title": "Pricing",
      "ui:icon": "dollar",
      "price": {
        "ui:widget": "currency",
        "ui:placeholder": "0.00",
        "ui:options": {
          "currency": "USD",
          "precision": 2
        }
      },
      "comparePrice": {
        "ui:widget": "currency",
        "ui:placeholder": "0.00",
        "ui:help": "Original price for discount display"
      },
      "currency": {
        "ui:widget": "select",
        "ui:options": {
          "enumNames": ["US Dollar", "Euro", "Vietnamese Dong"]
        }
      }
    },
    "inventory": {
      "ui:title": "Inventory",
      "ui:icon": "package",
      "sku": {
        "ui:widget": "text",
        "ui:placeholder": "SKU-001",
        "ui:help": "Stock Keeping Unit"
      },
      "quantity": {
        "ui:widget": "number",
        "ui:placeholder": "0",
        "ui:options": {
          "step": 1,
          "min": 0
        }
      },
      "trackInventory": {
        "ui:widget": "switch",
        "ui:title": "Track inventory quantities"
      }
    }
  }
}
```