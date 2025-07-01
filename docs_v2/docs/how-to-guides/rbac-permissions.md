---
sidebar_position: 3
---

# Configure RBAC & Permissions

## Tổng Quan

MongoREST sử dụng Role-Based Access Control (RBAC) để kiểm soát quyền truy cập ở cấp độ field. Hướng dẫn này sẽ giúp bạn cấu hình RBAC cho collections.

## Cấu Trúc RBAC Configuration

### Basic Structure

```json
{
  "collection_name": "your_collection",
  "rbac_config": {
    "GET": [...],
    "POST": [...],
    "PUT": [...],
    "PATCH": [...],
    "DELETE": [...]
  }
}
```

## Cấu Hình Theo Method

### GET - Read Permissions

Kiểm soát fields nào được phép đọc cho mỗi role:

```json
{
  "GET": [
    {
      "user_role": "guest",
      "patterns": [
        {"_id": {"type": "string"}},
        {"name": {"type": "string"}},
        {"status": {"type": "string"}}
      ]
    },
    {
      "user_role": "user",
      "patterns": [
        {"_id": {"type": "string"}},
        {"name": {"type": "string"}},
        {"email": {"type": "string"}},
        {"profile": {"type": "object"}},
        {"orders": {"type": "relation", "relate_collection": "orders"}}
      ]
    },
    {
      "user_role": "admin",
      "patterns": [
        // Admin có thể đọc tất cả fields
      ]
    }
  ]
}
```

### POST - Create Permissions

Định nghĩa fields nào được phép khi tạo document:

```json
{
  "POST": [
    {
      "user_role": "user",
      "patterns": [
        {
          "name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
          }
        },
        {
          "email": {
            "type": "string",
            "format": "email",
            "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
          }
        },
        {
          "category": {
            "type": "string",
            "enum": ["electronics", "clothing", "food"]
          }
        }
      ]
    }
  ]
}
```

### PATCH - Update Permissions

Giới hạn fields có thể update:

```json
{
  "PATCH": [
    {
      "user_role": "user",
      "patterns": [
        {
          "profile": {"type": "object"}
        },
        {
          "preferences": {
            "type": "object",
            "properties": {
              "theme": {"enum": ["light", "dark"]},
              "language": {"enum": ["en", "vi", "fr"]}
            }
          }
        }
      ]
    },
    {
      "user_role": "admin",
      "patterns": [
        {"status": {"type": "string", "enum": ["active", "suspended", "deleted"]}},
        {"role": {"type": "string", "enum": ["user", "moderator", "admin"]}},
        {"permissions": {"type": "array"}}
      ]
    }
  ]
}
```

### DELETE - Delete Permissions

Kiểm soát ai có thể xóa documents:

```json
{
  "DELETE": [
    {
      "user_role": "admin"
    },
    {
      "user_role": "moderator",
      "conditions": {
        "createdBy": "{{user.id}}"
      }
    }
  ]
}
```

## Field Pattern Types

### Basic Types

```json
{
  "patterns": [
    // String field
    {"fieldName": {"type": "string"}},
    
    // Number field
    {"price": {"type": "number", "minimum": 0}},
    
    // Boolean field
    {"isActive": {"type": "boolean"}},
    
    // Array field
    {"tags": {"type": "array", "items": {"type": "string"}}},
    
    // Object field
    {"metadata": {"type": "object"}}
  ]
}
```

### Validation Rules

```json
{
  "patterns": [
    // String với validation
    {
      "email": {
        "type": "string",
        "format": "email",
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      }
    },
    
    // Number với range
    {
      "age": {
        "type": "number",
        "minimum": 0,
        "maximum": 150
      }
    },
    
    // String với enum
    {
      "status": {
        "type": "string",
        "enum": ["pending", "active", "suspended"]
      }
    },
    
    // Array với constraints
    {
      "items": {
        "type": "array",
        "minItems": 1,
        "maxItems": 100
      }
    }
  ]
}
```

### Nested Fields

```json
{
  "patterns": [
    // Nested object field
    {
      "address": {
        "type": "object",
        "properties": {
          "street": {"type": "string"},
          "city": {"type": "string"},
          "country": {"type": "string"}
        },
        "required": ["city", "country"]
      }
    },
    
    // Dot notation access
    {
      "payment.status": {
        "type": "string",
        "enum": ["pending", "completed", "failed"]
      }
    }
  ]
}
```

### Relation Fields

```json
{
  "patterns": [
    // Simple relation
    {
      "userId": {
        "type": "relation",
        "relate_collection": "users"
      }
    },
    
    // Relation với validation
    {
      "categoryId": {
        "type": "relation",
        "relate_collection": "categories",
        "pattern": "^[0-9a-fA-F]{24}$"
      }
    }
  ]
}
```

## Complete RBAC Example

### E-commerce Order Collection

```json
{
  "collection_name": "orders",
  "rbac_config": {
    "GET": [
      {
        "user_role": "guest",
        "patterns": [
          {"_id": {"type": "string"}},
          {"orderNumber": {"type": "string"}},
          {"status": {"type": "string"}}
        ]
      },
      {
        "user_role": "customer",
        "patterns": [
          {"_id": {"type": "string"}},
          {"orderNumber": {"type": "string"}},
          {"items": {"type": "array"}},
          {"totalAmount": {"type": "number"}},
          {"status": {"type": "string"}},
          {"shippingAddress": {"type": "object"}},
          {"orderDate": {"type": "string"}},
          {"estimatedDelivery": {"type": "string"}}
        ]
      },
      {
        "user_role": "staff",
        "patterns": [
          {"_id": {"type": "string"}},
          {"orderNumber": {"type": "string"}},
          {"customerId": {"type": "string"}},
          {"items": {"type": "array"}},
          {"totalAmount": {"type": "number"}},
          {"status": {"type": "string"}},
          {"shippingAddress": {"type": "object"}},
          {"billingAddress": {"type": "object"}},
          {"payment": {"type": "object"}},
          {"orderDate": {"type": "string"}},
          {"shippedDate": {"type": "string"}},
          {"customer": {"type": "relation", "relate_collection": "users"}}
        ]
      },
      {
        "user_role": "admin",
        "patterns": []  // Full access
      }
    ],
    "POST": [
      {
        "user_role": "customer",
        "patterns": [
          {
            "items": {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "object",
                "properties": {
                  "productId": {"type": "string"},
                  "quantity": {"type": "number", "minimum": 1}
                },
                "required": ["productId", "quantity"]
              }
            }
          },
          {
            "shippingAddress": {
              "type": "object",
              "properties": {
                "street": {"type": "string"},
                "city": {"type": "string"},
                "postalCode": {"type": "string"},
                "country": {"type": "string"}
              },
              "required": ["street", "city", "postalCode", "country"]
            }
          },
          {
            "payment": {
              "type": "object",
              "properties": {
                "method": {"enum": ["credit_card", "paypal", "bank_transfer"]}
              },
              "required": ["method"]
            }
          }
        ]
      }
    ],
    "PATCH": [
      {
        "user_role": "customer",
        "patterns": [
          {
            "shippingAddress": {"type": "object"}
          },
          {
            "notes": {"type": "string", "maxLength": 500}
          }
        ]
      },
      {
        "user_role": "staff",
        "patterns": [
          {
            "status": {
              "type": "string",
              "enum": ["processing", "shipped", "delivered"]
            }
          },
          {
            "shippedDate": {"type": "string", "format": "date-time"}
          },
          {
            "trackingNumber": {"type": "string"}
          }
        ]
      },
      {
        "user_role": "admin",
        "patterns": []  // Can update any field
      }
    ],
    "DELETE": [
      {
        "user_role": "admin"
      }
    ]
  }
}
```

## Best Practices

### 1. Principle of Least Privilege

Always give users the minimum permissions needed:

```json
{
  "user_role": "basic_user",
  "patterns": [
    // Only essential fields
    {"_id": {"type": "string"}},
    {"name": {"type": "string"}},
    {"public_profile": {"type": "object"}}
  ]
}
```

### 2. Use Validation Rules

Add validation to prevent bad data:

```json
{
  "email": {
    "type": "string",
    "format": "email",
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "maxLength": 255
  }
}
```

### 3. Separate Read and Write Permissions

Different fields for read vs write:

```json
{
  "GET": [
    {
      "user_role": "user",
      "patterns": [
        {"balance": {"type": "number"}},  // Can read
        {"transactions": {"type": "array"}}  // Can read
      ]
    }
  ],
  "PATCH": [
    {
      "user_role": "user",
      "patterns": [
        // Cannot update balance or transactions
        {"profile": {"type": "object"}}
      ]
    }
  ]
}
```

### 4. Use Enums for Fixed Values

```json
{
  "status": {
    "type": "string",
    "enum": ["draft", "published", "archived"],
    "default": "draft"
  }
}
```

### 5. Document Your Permissions

Add comments to explain complex rules:

```json
{
  "patterns": [
    // Users can only update their own profile
    {"profile": {"type": "object"}},
    
    // Only verified users can update email
    {"email": {"type": "string", "requireVerified": true}}
  ]
}
```

## Troubleshooting

### Common Issues

1. **Fields not showing in response**
   - Check if field is in patterns for user's role
   - Verify role is correctly set in JWT token

2. **Cannot update certain fields**
   - Check PATCH/PUT patterns for the role
   - Ensure field validation rules are met

3. **Delete operation forbidden**
   - Verify role exists in DELETE configuration
   - Check any additional conditions

### Debug Mode

Enable debug mode to see RBAC decisions:

```
GET /products?debug=true
```

Response will include:

```json
{
  "debug": {
    "rbacApplied": {
      "role": "user",
      "allowedFields": ["name", "price"],
      "hiddenFields": ["cost", "supplier"],
      "method": "GET"
    }
  }
}
```

## Integration với Schema

RBAC config có thể được embed trong schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "collection": "products",
  "properties": {
    // Schema definitions
  },
  "mongorest": {
    "rbac": {
      "GET": [...],
      "POST": [...],
      "PATCH": [...],
      "DELETE": [...]
    }
  }
}
```

## Dynamic Permissions

Sử dụng conditions cho dynamic permissions:

```json
{
  "PATCH": [
    {
      "user_role": "user",
      "conditions": {
        "ownerId": "{{user.id}}"  // Only owner can update
      },
      "patterns": [
        {"title": {"type": "string"}},
        {"content": {"type": "string"}}
      ]
    }
  ]
}
```

## Security Tips

1. **Review permissions regularly**
2. **Test with different roles**
3. **Use validation extensively**
4. **Log permission denials**
5. **Implement audit trails**
6. **Use enums for sensitive fields**
7. **Minimize admin access**
8. **Document all permissions**
