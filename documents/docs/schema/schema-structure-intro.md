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

### 1.1 User Schema với UI Schema

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
      "description": "Full name of user",
      "widget": "shortAnswer"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User email address",
      "widget": "shortAnswer"
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 30,
      "pattern": "^[a-zA-Z0-9_]+$",
      "widget": "shortAnswer"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "description": "Encrypted password",
      "widget": "password"
    },
    "phone": {
      "type": ["string", "null"],
      "pattern": "^\\+?[1-9]\\d{1,14}$",
      "widget": "shortAnswer"
    },
    "avatar": {
      "type": ["string", "null"],
      "format": "uri",
      "widget": "file"
    },
    "birthDate": {
      "type": ["string", "null"],
      "format": "date",
      "widget": "date"
    },
    "gender": {
      "type": "string",
      "enum": ["male", "female", "other"],
      "default": "other",
      "widget": "radio"
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "banned", "pending"],
      "default": "pending",
      "widget": "select"
    },
    "emailVerified": {
      "type": "boolean",
      "default": false,
      "widget": "boolean"
    },
    "lastLogin": {
      "type": ["string", "null"],
      "format": "date-time",
      "widget": "dateTime"
    },
    "bio": {
      "type": ["string", "null"],
      "maxLength": 1000,
      "widget": "textarea"
    },
    "preferences": {
      "type": "object",
      "properties": {
        "language": {
          "type": "string",
          "enum": ["en", "vi", "ja"],
          "default": "en",
          "widget": "select"
        },
        "notifications": {
          "type": "object",
          "properties": {
            "email": { "type": "boolean", "default": true, "widget": "boolean" },
            "push": { "type": "boolean", "default": true, "widget": "boolean" },
            "sms": { "type": "boolean", "default": false, "widget": "boolean" }
          }
        }
      }
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string", "widget": "shortAnswer" },
        "city": { "type": "string", "widget": "shortAnswer" },
        "state": { "type": "string", "widget": "shortAnswer" },
        "zipCode": { "type": "string", "pattern": "^\\d{5}(-\\d{4})?$", "widget": "shortAnswer" },
        "country": { "type": "string", "default": "VN", "widget": "select" }
      }
    },
    "socialLinks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "platform": {
            "type": "string",
            "enum": ["facebook", "twitter", "linkedin", "instagram"],
            "widget": "select"
          },
          "url": { "type": "string", "format": "uri", "widget": "href" }
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

### 2.1 Product Schema với UI Schema

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
      "description": "Product name",
      "widget": "shortAnswer"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "URL-friendly product identifier",
      "widget": "UriKeyGen"
    },
    "description": {
      "type": "string",
      "maxLength": 5000,
      "description": "Detailed product description",
      "widget": "textarea"
    },
    "shortDescription": {
      "type": "string",
      "maxLength": 500,
      "description": "Brief product summary",
      "widget": "textarea"
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 0.01,
      "description": "Current selling price",
      "widget": "numberInput"
    },
    "comparePrice": {
      "type": ["number", "null"],
      "minimum": 0,
      "description": "Original price for comparison",
      "widget": "numberInput"
    },
    "costPrice": {
      "type": ["number", "null"],
      "minimum": 0,
      "description": "Cost price for internal use",
      "widget": "numberInput"
    },
    "sku": {
      "type": "string",
      "pattern": "^[A-Z0-9-]+$",
      "description": "Stock Keeping Unit",
      "widget": "shortAnswer"
    },
    "barcode": {
      "type": ["string", "null"],
      "description": "Product barcode",
      "widget": "shortAnswer"
    },
    "weight": {
      "type": ["number", "null"],
      "minimum": 0,
      "description": "Product weight in grams",
      "widget": "numberInput"
    },
    "dimensions": {
      "type": "object",
      "properties": {
        "length": { "type": "number", "minimum": 0, "widget": "numberInput" },
        "width": { "type": "number", "minimum": 0, "widget": "numberInput" },
        "height": { "type": "number", "minimum": 0, "widget": "numberInput" },
        "unit": { "type": "string", "enum": ["cm", "in"], "default": "cm", "widget": "radio" }
      }
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
        "lowStockThreshold": {
          "type": "integer",
          "minimum": 0,
          "default": 10,
          "widget": "numberInput"
        },
        "trackQuantity": {
          "type": "boolean",
          "default": true,
          "widget": "boolean"
        },
        "allowBackorders": {
          "type": "boolean",
          "default": false,
          "widget": "boolean"
        }
      }
    },
    "status": {
      "type": "string",
      "enum": ["draft", "active", "inactive", "discontinued"],
      "default": "draft",
      "widget": "select"
    },
    "featured": {
      "type": "boolean",
      "default": false,
      "widget": "boolean"
    },
    "categoryId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation"
    },
    "brandId": {
      "type": ["string", "null"],
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true,
      "maxItems": 20,
      "widget": "checkbox"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri", "widget": "file" },
          "alt": { "type": "string", "widget": "shortAnswer" },
          "position": { "type": "integer", "minimum": 0, "widget": "numberInput" },
          "isPrimary": { "type": "boolean", "default": false, "widget": "boolean" }
        },
        "required": ["url"]
      },
      "maxItems": 10,
      "widget": "multipleFiles"
    },
    "variants": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "widget": "shortAnswer" },
          "sku": { "type": "string", "widget": "shortAnswer" },
          "price": { "type": "number", "minimum": 0, "widget": "numberInput" },
          "quantity": { "type": "integer", "minimum": 0, "widget": "numberInput" },
          "options": {
            "type": "object",
            "properties": {
              "size": { "type": "string", "widget": "select" },
              "color": { "type": "string", "widget": "shortAnswer" },
              "material": { "type": "string", "widget": "shortAnswer" }
            }
          }
        },
        "required": ["name", "sku", "price"]
      }
    },
    "seo": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "maxLength": 60, "widget": "shortAnswer" },
        "description": { "type": "string", "maxLength": 160, "widget": "textarea" },
        "keywords": {
          "type": "array",
          "items": { "type": "string" },
          "widget": "checkbox"
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
      "maxLength": 100,
      "widget": "shortAnswer"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "widget": "UriKeyGen"
    },
    "description": {
      "type": ["string", "null"],
      "maxLength": 1000,
      "widget": "textarea"
    },
    "parentId": {
      "type": ["string", "null"],
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation"
    },
    "level": {
      "type": "integer",
      "minimum": 0,
      "maximum": 5,
      "default": 0,
      "widget": "numberInput"
    },
    "path": {
      "type": "string",
      "description": "Hierarchical path like '/electronics/computers/laptops'",
      "widget": "shortAnswer"
    },
    "position": {
      "type": "integer",
      "minimum": 0,
      "default": 0,
      "widget": "numberInput"
    },
    "icon": {
      "type": ["string", "null"],
      "format": "uri",
      "widget": "icon"
    },
    "image": {
      "type": ["string", "null"],
      "format": "uri",
      "widget": "file"
    },
    "isActive": {
      "type": "boolean",
      "default": true,
      "widget": "boolean"
    },
    "isVisible": {
      "type": "boolean",
      "default": true,
      "widget": "boolean"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "productCount": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "widget": "numberInput"
        },
        "childrenCount": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "widget": "numberInput"
        }
      }
    },
    "seo": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "widget": "shortAnswer" },
        "description": { "type": "string", "widget": "textarea" },
        "keywords": { "type": "array", "items": { "type": "string" }, "widget": "checkbox" }
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
      "pattern": "^ORD-\\d{8}-\\d{4}$",
      "widget": "shortAnswer"
    },
    "customerId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      "widget": "select"
    },
    "paymentMethod": {
      "type": "string",
      "enum": ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"],
      "widget": "select"
    },
    "shippingMethod": {
      "type": "string",
      "enum": ["standard", "express", "overnight", "pickup"],
      "widget": "select"
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
      "maxLength": 200,
      "widget": "shortAnswer"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "widget": "UriKeyGen"
    },
    "content": {
      "type": "string",
      "minLength": 1,
      "widget": "textarea"
    },
    "excerpt": {
      "type": ["string", "null"],
      "maxLength": 300,
      "widget": "textarea"
    },
    "authorId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation"
    },
    "categoryIds": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[0-9a-fA-F]{24}$"
      },
      "minItems": 1,
      "maxItems": 5,
      "widget": "checkbox"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true,
      "widget": "checkbox"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published", "scheduled", "archived"],
      "default": "draft",
      "widget": "select"
    },
    "publishedAt": {
      "type": ["string", "null"],
      "format": "date-time",
      "widget": "dateTime"
    },
    "featuredImage": {
      "type": ["string", "null"],
      "format": "uri",
      "widget": "file"
    },
    "viewCount": {
      "type": "integer",
      "minimum": 0,
      "default": 0,
      "widget": "numberInput"
    },
    "allowComments": {
      "type": "boolean",
      "default": true,
      "widget": "boolean"
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

## Tổng kết

Schema trong MongoREST cung cấp:

1. **Validation mạnh mẽ**: JSON Schema validation + MongoDB validation
2. **Relationships linh hoạt**: belongsTo, hasMany, manyToMany
3. **Conditional logic**: if/then/else cho business rules phức tạp
4. **Type safety**: Strict typing với comprehensive validation
5. **Performance**: Built-in indexing và query optimization

Next: [Detailed Schema Structure →](./schema-structure)