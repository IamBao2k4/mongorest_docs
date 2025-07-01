# E-commerce Platform Example

## Giới thiệu

Hướng dẫn này sẽ giúp bạn xây dựng một nền tảng e-commerce hoàn chỉnh sử dụng MongoREST, từ việc thiết kế schema đến triển khai các tính năng phức tạp như giỏ hàng, thanh toán và quản lý kho.

## 1. Thiết kế Schema

### Products Collection

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Products",
  "collection": "products",
  "type": "object",
  "properties": {
    "_id": {
      "type": "string",
      "description": "Product ID"
    },
    "name": {
      "type": "string",
      "minLength": 3,
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
      "widget": "numberInput"
    },
    "comparePrice": {
      "type": "number",
      "minimum": 0,
      "description": "Original price for discount display"
    },
    "sku": {
      "type": "string",
      "pattern": "^[A-Z0-9-]+$",
      "unique": true
    },
    "stock": {
      "type": "integer",
      "minimum": 0,
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
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri" },
          "alt": { "type": "string" },
          "isPrimary": { "type": "boolean" }
        }
      },
      "widget": "multiImage"
    },
    "variants": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "sku": { "type": "string" },
          "price": { "type": "number" },
          "stock": { "type": "integer" },
          "attributes": { "type": "object" }
        }
      }
    },
    "seo": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "maxLength": 60 },
        "description": { "type": "string", "maxLength": 160 },
        "keywords": { "type": "array", "items": { "type": "string" } }
      }
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
      "collection": "product_reviews",
      "localField": "_id",
      "foreignField": "productId",
      "defaultSort": { "createdAt": -1 },
      "pagination": { "defaultLimit": 10, "maxLimit": 50 }
    },
    "relatedProducts": {
      "type": "manyToMany",
      "collection": "products",
      "through": "related_products",
      "localField": "_id",
      "throughLocalField": "productId",
      "throughForeignField": "relatedProductId",
      "foreignField": "_id"
    }
  },
  "indexes": [
    { "fields": { "slug": 1 }, "unique": true },
    { "fields": { "sku": 1 }, "unique": true },
    { "fields": { "categoryId": 1, "status": 1 } },
    { "fields": { "price": 1, "createdAt": -1 } },
    { "fields": { "name": "text", "description": "text" } }
  ],
  "mongorest": {
    "plugins": {
      "created_at": { "isTurnOn": true },
      "updated_at": { "isTurnOn": true }
    },
    "permissions": {
      "read": ["guest", "user", "admin"],
      "create": ["admin"],
      "update": ["admin"],
      "delete": ["admin"]
    }
  }
}
```

### Orders Collection

```json
{
  "collection": "orders",
  "properties": {
    "orderNumber": {
      "type": "string",
      "pattern": "^ORD-[0-9]{8}$",
      "unique": true
    },
    "customerId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "processing", "shipped", "delivered", "cancelled"],
      "default": "pending"
    },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "productId": { "type": "string" },
          "variantId": { "type": "string" },
          "name": { "type": "string" },
          "price": { "type": "number" },
          "quantity": { "type": "integer", "minimum": 1 },
          "subtotal": { "type": "number" }
        },
        "required": ["productId", "name", "price", "quantity"]
      }
    },
    "shippingAddress": {
      "type": "object",
      "properties": {
        "fullName": { "type": "string" },
        "phone": { "type": "string" },
        "street": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "postalCode": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["fullName", "phone", "street", "city", "country"]
    },
    "payment": {
      "type": "object",
      "properties": {
        "method": { "type": "string", "enum": ["card", "paypal", "cod"] },
        "status": { "type": "string", "enum": ["pending", "paid", "failed"] },
        "transactionId": { "type": "string" }
      }
    },
    "subtotal": { "type": "number" },
    "shipping": { "type": "number" },
    "tax": { "type": "number" },
    "discount": { "type": "number" },
    "totalAmount": { "type": "number" }
  },
  "relationships": {
    "customer": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "customerId",
      "foreignField": "_id"
    },
    "products": {
      "type": "hasMany",
      "collection": "products",
      "localField": "items.productId",
      "foreignField": "_id"
    }
  },
  "rbac_config": {
    "GET": [
      {
        "user_role": "user",
        "patterns": [
          { "_id": { "type": "string" } },
          { "orderNumber": { "type": "string" } },
          { "status": { "type": "string" } },
          { "totalAmount": { "type": "number" } },
          { "items": { "type": "array" } }
        ],
        "condition": "owner_only"
      },
      {
        "user_role": "admin",
        "patterns": []
      }
    ]
  }
}
```

## 2. API Endpoints & Examples

### Product Management

#### Lấy danh sách sản phẩm với filters

```bash
# Tìm sản phẩm active, có giá từ $50-$200, thuộc category Electronics
GET /products?and=(status=eq.active,price=gte.50,price=lte.200)&category.slug=eq.electronics&select=name,price,slug,images,category(name,slug)&sort=price&order=asc&limit=20

# Response
{
  "success": true,
  "data": [
    {
      "name": "Wireless Mouse",
      "price": 59.99,
      "slug": "wireless-mouse",
      "images": [
        {
          "url": "https://cdn.example.com/mouse1.jpg",
          "alt": "Wireless Mouse Front View",
          "isPrimary": true
        }
      ],
      "category": {
        "name": "Electronics",
        "slug": "electronics"
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "hasNext": true
  }
}
```

#### Tìm kiếm sản phẩm

```bash
# Full-text search
GET /products?search=gaming keyboard&searchFields=name,description&select=name,price,slug,stock

# Search với filters
GET /products?search=laptop&and=(price=lte.1500,stock=gt.0)&select=name,price,comparePrice,slug
```

#### Chi tiết sản phẩm với reviews

```bash
GET /products/60f7b3b3b3b3b3b3b3b3b3b3?select=*,category(*),reviews(rating,comment,user(name),createdAt)!limit.5,avgRating:reviews!avg(rating),reviewCount:reviews!count

# Response với aggregated data
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Gaming Laptop Pro",
    "price": 1299.99,
    "comparePrice": 1499.99,
    "category": {
      "_id": "60f7a2a2a2a2a2a2a2a2a2a2",
      "name": "Laptops",
      "slug": "laptops"
    },
    "reviews": [
      {
        "rating": 5,
        "comment": "Excellent performance!",
        "user": {
          "name": "John Doe"
        },
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ],
    "avgRating": 4.5,
    "reviewCount": 23
  }
}
```

### Shopping Cart Management

#### Custom Function: Add to Cart

```json
// schemas/functions/addToCart.json
{
  "name": "addToCart",
  "description": "Add product to user's cart",
  "method": "POST",
  "input": {
    "type": "object",
    "properties": {
      "productId": { "type": "string", "required": true },
      "variantId": { "type": "string" },
      "quantity": { "type": "integer", "minimum": 1, "default": 1 }
    }
  },
  "steps": [
    {
      "id": "validateProduct",
      "type": "findOne",
      "collection": "products",
      "query": {
        "_id": "{{params.productId}}",
        "status": "active"
      }
    },
    {
      "id": "checkStock",
      "type": "validate",
      "condition": "{{steps.validateProduct.output.stock >= params.quantity}}",
      "errorMessage": "Insufficient stock"
    },
    {
      "id": "getCart",
      "type": "findOne",
      "collection": "carts",
      "query": { "userId": "{{user.id}}" },
      "upsert": true,
      "default": {
        "userId": "{{user.id}}",
        "items": []
      }
    },
    {
      "id": "updateCart",
      "type": "update",
      "collection": "carts",
      "filter": { "userId": "{{user.id}}" },
      "update": {
        "$push": {
          "items": {
            "productId": "{{params.productId}}",
            "variantId": "{{params.variantId}}",
            "quantity": "{{params.quantity}}",
            "price": "{{steps.validateProduct.output.price}}",
            "addedAt": "{{Date.now()}}"
          }
        }
      }
    },
    {
      "id": "calculateTotals",
      "type": "aggregate",
      "collection": "carts",
      "pipeline": [
        { "$match": { "userId": "{{user.id}}" } },
        { "$unwind": "$items" },
        { "$group": {
          "_id": null,
          "subtotal": { "$sum": { "$multiply": ["$items.price", "$items.quantity"] } },
          "itemCount": { "$sum": "$items.quantity" }
        }}
      ]
    }
  ],
  "output": {
    "cart": "{{steps.getCart.output}}",
    "totals": "{{steps.calculateTotals.output}}"
  }
}
```

#### Sử dụng Cart API

```bash
# Add to cart
POST /functions/addToCart
{
  "productId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "quantity": 2
}

# Get cart with product details
GET /carts?userId=eq.{{currentUserId}}&select=*,items.product:products(name,price,images)

# Update cart item quantity
PATCH /carts/{{cartId}}
{
  "items": [
    {
      "productId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "quantity": 3
    }
  ]
}

# Clear cart
DELETE /carts/{{cartId}}/items
```

### Order Processing

#### Create Order Function

```json
{
  "name": "createOrder",
  "description": "Create order from cart",
  "steps": [
    {
      "id": "getCart",
      "type": "findOne",
      "collection": "carts",
      "query": { "userId": "{{user.id}}" }
    },
    {
      "id": "validateCart",
      "type": "validate",
      "condition": "{{steps.getCart.output.items.length > 0}}",
      "errorMessage": "Cart is empty"
    },
    {
      "id": "checkInventory",
      "type": "aggregate",
      "collection": "products",
      "pipeline": [
        { "$match": {
          "_id": { "$in": "{{steps.getCart.output.items.map(i => i.productId)}}" }
        }},
        { "$project": {
          "_id": 1,
          "stock": 1,
          "requiredQty": {
            "$arrayElemAt": [
              "{{steps.getCart.output.items.map(i => i.quantity)}}",
              { "$indexOfArray": ["{{steps.getCart.output.items.map(i => i.productId)}}", "$_id"] }
            ]
          }
        }},
        { "$match": {
          "$expr": { "$lt": ["$stock", "$requiredQty"] }
        }}
      ]
    },
    {
      "id": "createOrder",
      "type": "insert",
      "collection": "orders",
      "document": {
        "orderNumber": "ORD-{{Date.now()}}",
        "customerId": "{{user.id}}",
        "items": "{{steps.getCart.output.items}}",
        "status": "pending",
        "shippingAddress": "{{params.shippingAddress}}",
        "payment": {
          "method": "{{params.paymentMethod}}",
          "status": "pending"
        },
        "subtotal": "{{calculateSubtotal(steps.getCart.output.items)}}",
        "shipping": "{{calculateShipping(params.shippingAddress)}}",
        "tax": "{{calculateTax(subtotal, params.shippingAddress)}}",
        "totalAmount": "{{subtotal + shipping + tax}}"
      }
    },
    {
      "id": "updateInventory",
      "type": "bulkUpdate",
      "collection": "products",
      "operations": "{{steps.getCart.output.items.map(item => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } }
        }
      }))}}"
    },
    {
      "id": "clearCart",
      "type": "delete",
      "collection": "carts",
      "filter": { "userId": "{{user.id}}" }
    },
    {
      "id": "sendEmail",
      "type": "http",
      "method": "POST",
      "url": "{{env.EMAIL_SERVICE_URL}}/send",
      "body": {
        "to": "{{user.email}}",
        "template": "order_confirmation",
        "data": {
          "orderNumber": "{{steps.createOrder.output.orderNumber}}",
          "totalAmount": "{{steps.createOrder.output.totalAmount}}"
        }
      }
    }
  ]
}
```

### Inventory Management

#### Stock tracking với plugins

```bash
# Get low stock products
GET /products?and=(stock=lt.10,status=eq.active)&select=name,sku,stock&sort=stock&order=asc

# Bulk update stock
POST /batch/products
{
  "operations": [
    {
      "type": "update",
      "filter": { "sku": "PROD-001" },
      "data": { "stock": 100 }
    },
    {
      "type": "update",
      "filter": { "sku": "PROD-002" },
      "data": { "stock": 50 }
    }
  ],
  "options": {
    "transaction": true
  }
}
```

#### Real-time stock monitoring

```javascript
// Custom function for stock alerts
{
  "name": "stockAlert",
  "description": "Monitor and alert low stock",
  "schedule": "0 */6 * * *", // Every 6 hours
  "steps": [
    {
      "id": "findLowStock",
      "type": "find",
      "collection": "products",
      "query": {
        "stock": { "$lte": 10 },
        "status": "active"
      }
    },
    {
      "id": "createAlerts",
      "type": "insertMany",
      "collection": "alerts",
      "documents": "{{steps.findLowStock.output.map(p => ({
        type: 'low_stock',
        productId: p._id,
        productName: p.name,
        currentStock: p.stock,
        severity: p.stock === 0 ? 'critical' : 'warning',
        createdAt: new Date()
      }))}}"
    }
  ]
}
```

## 3. Analytics & Reporting

### Sales Analytics

```bash
# Daily sales report
GET /functions/salesReport
POST /functions/salesReport
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "day"
}

# Response
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 125000,
      "totalOrders": 523,
      "averageOrderValue": 239.08
    },
    "daily": [
      {
        "date": "2024-01-01",
        "revenue": 4500,
        "orders": 18,
        "products": 45
      }
    ],
    "topProducts": [
      {
        "productId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Gaming Laptop Pro",
        "unitsSold": 45,
        "revenue": 58495.55
      }
    ]
  }
}
```

### Customer Analytics

```bash
# Customer lifetime value
GET /users?select=name,email,totalPurchases:orders!sum(totalAmount),orderCount:orders!count,lastOrder:orders(orderNumber,createdAt)!sort.createdAt.desc!limit.1

# Customer segmentation
GET /functions/customerSegments
{
  "segments": [
    {
      "name": "VIP",
      "criteria": { "totalPurchases": { "$gte": 5000 } },
      "count": 123,
      "avgValue": 8500
    },
    {
      "name": "Regular",
      "criteria": { "totalPurchases": { "$gte": 500, "$lt": 5000 } },
      "count": 1523,
      "avgValue": 1200
    }
  ]
}
```

## 4. Performance Optimization

### Caching Strategy

```javascript
// Redis caching for product listings
const cacheConfig = {
  products: {
    list: {
      ttl: 300, // 5 minutes
      keyPattern: 'products:list:{category}:{page}:{sort}'
    },
    detail: {
      ttl: 600, // 10 minutes
      keyPattern: 'products:detail:{id}'
    }
  }
};
```

### Database Indexes

```javascript
// Optimize common queries
db.products.createIndex({ "categoryId": 1, "status": 1, "price": 1 });
db.products.createIndex({ "name": "text", "description": "text" });
db.orders.createIndex({ "customerId": 1, "createdAt": -1 });
db.orders.createIndex({ "status": 1, "createdAt": -1 });
```

## 5. Security Best Practices

### Payment Security

```json
{
  "payment": {
    "type": "object",
    "security": "sensitive",
    "properties": {
      "cardNumber": {
        "type": "string",
        "write": ["payment_processor"],
        "read": false,
        "encryption": true
      },
      "last4": {
        "type": "string",
        "read": ["user", "admin"]
      }
    }
  }
}
```

### Order Access Control

```javascript
// RBAC for orders
{
  "GET": [
    {
      "user_role": "user",
      "condition": "owner_only",
      "filter": { "customerId": "{{user.id}}" }
    },
    {
      "user_role": "support",
      "fields": ["orderNumber", "status", "totalAmount", "createdAt"]
    },
    {
      "user_role": "admin",
      "fields": "*"
    }
  ]
}
```

## 6. Deployment Checklist

### Production Setup

- [ ] Configure environment variables
- [ ] Set up MongoDB indexes
- [ ] Configure Redis for caching
- [ ] Set up payment gateway integration
- [ ] Configure email service
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test order processing flow
- [ ] Load test with expected traffic

### Monitoring

```javascript
// Key metrics to monitor
const metrics = {
  business: [
    'orders_per_minute',
    'average_order_value',
    'cart_abandonment_rate',
    'conversion_rate'
  ],
  technical: [
    'api_response_time',
    'database_query_time',
    'cache_hit_rate',
    'error_rate'
  ]
};
```

## Conclusion

MongoREST cung cấp một nền tảng mạnh mẽ để xây dựng hệ thống e-commerce với đầy đủ tính năng. Với schema-driven approach, built-in security, và powerful query capabilities, bạn có thể tập trung vào business logic thay vì infrastructure.

### Next Steps

- Explore [CMS Example](./cms-example.md) cho content management
- Read [Analytics Example](./analytics-example.md) cho advanced reporting
- Check [Migration Guide](./migration-guide.md) để migrate từ existing system