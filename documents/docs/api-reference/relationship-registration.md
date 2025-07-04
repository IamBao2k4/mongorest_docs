---
sidebar_position: 8
---

# Relationship Registration Guide

## Tổng quan

MongoREST cung cấp hệ thống đăng ký relationships giữa các collections/tables. Hướng dẫn này sẽ giải thích cách định nghĩa và đăng ký các mối quan hệ trong ứng dụng của bạn.

## Các loại Relationships

MongoREST hỗ trợ 4 loại quan hệ chính:

| Loại | Mô tả | Ví dụ |
|------|-------|-------|
| **OneToOne** | Quan hệ 1-1 | User → Profile |
| **OneToMany** | Quan hệ 1-nhiều | User → Posts |
| **ManyToOne** | Quan hệ nhiều-1 | Post → User |
| **ManyToMany** | Quan hệ nhiều-nhiều | Post ↔ Tags |

## Relationship Definition Formats

MongoREST hỗ trợ 2 format để định nghĩa relationships:

### Format 1: Simplified (Recommended)
```typescript
{
  name: 'posts',
  type: 'oneToMany',        // camelCase
  targetTable: 'posts',
  foreignKey: 'authorId'
}
```

### Format 2: Detailed
```typescript
{
  name: "posts",
  targetTable: "posts",
  localField: "_id",        // Explicitly define local field
  foreignField: "authorId", // Explicitly define foreign field
  type: "one-to-many"      // kebab-case
}
```

**Sự khác biệt chính:**
- Format 1 sử dụng `foreignKey` và tự động suy ra các fields
- Format 2 sử dụng `localField` và `foreignField` rõ ràng
- Format 1 dùng camelCase cho type (`oneToMany`)
- Format 2 dùng kebab-case cho type (`one-to-many`)
- Format 2 cho phép control chi tiết hơn với `junction` object cho many-to-many

## Cách đăng ký Relationships

### 1. Import RelationshipRegistry

```typescript
import { RelationshipRegistry } from '@mongorest/core';

// Tạo instance registry
const registry = new RelationshipRegistry();
```

### 2. Định nghĩa Relationships

#### OneToOne Relationship
```typescript
// User có một Profile
registry.registerFromDefinition('users', {
  name: 'profile',
  type: 'oneToOne',
  targetTable: 'profiles',
  foreignKey: 'userId'  // Field trong profiles table
});
```

#### OneToMany Relationship
```typescript
// User có nhiều Posts
registry.registerFromDefinition('users', {
  name: 'posts',
  type: 'oneToMany',
  targetTable: 'posts',
  foreignKey: 'authorId'  // Field trong posts table
});
```

#### ManyToOne Relationship
```typescript
// Post thuộc về một User
registry.registerFromDefinition('posts', {
  name: 'author',
  type: 'manyToOne',
  targetTable: 'users',
  foreignKey: 'authorId',  // Field trong posts table
  targetKey: '_id'        // Field trong users table (optional, default: _id)
});
```

#### ManyToMany Relationship

**Format 1: Simplified**
```typescript
// Post có nhiều Tags thông qua junction table
registry.registerFromDefinition('posts', {
  name: 'tags',
  type: 'manyToMany',
  targetTable: 'tags',
  through: 'post_tags',        // Junction table
  localKey: '_id',             // posts._id
  throughLocalKey: 'postId',   // post_tags.postId
  throughForeignKey: 'tagId',  // post_tags.tagId
  targetKey: '_id'             // tags._id
});
```

**Format 2: Detailed với junction object**
```typescript
// Product có nhiều Categories
registry.registerFromDefinition('products', {
  name: "categories",
  targetTable: "categories",
  localField: "_id",
  foreignField: "_id",
  type: "many-to-many",
  junction: {
    table: "product_categories",
    localKey: "productId",
    foreignKey: "categoryId"
  }
});
```

### 3. Bulk Registration

Đăng ký nhiều relationships cùng lúc:

```typescript
registry.registerBulk({
  // User relationships
  users: [
    {
      name: 'profile',
      type: 'oneToOne',
      targetTable: 'profiles',
      foreignKey: 'userId'
    },
    {
      name: 'posts',
      type: 'oneToMany',
      targetTable: 'posts',
      foreignKey: 'authorId'
    },
    {
      name: 'comments',
      type: 'oneToMany',
      targetTable: 'comments',
      foreignKey: 'userId'
    }
  ],
  
  // Post relationships
  posts: [
    {
      name: 'author',
      type: 'manyToOne',
      targetTable: 'users',
      foreignKey: 'authorId'
    },
    {
      name: 'comments',
      type: 'oneToMany',
      targetTable: 'comments',
      foreignKey: 'postId'
    },
    {
      name: 'tags',
      type: 'manyToMany',
      targetTable: 'tags',
      through: 'post_tags',
      localKey: '_id',
      throughLocalKey: 'postId',
      throughForeignKey: 'tagId',
      targetKey: '_id'
    }
  ],
  
  // Comment relationships
  comments: [
    {
      name: 'user',
      type: 'manyToOne',
      targetTable: 'users',
      foreignKey: 'userId'
    },
    {
      name: 'post',
      type: 'manyToOne',
      targetTable: 'posts',
      foreignKey: 'postId'
    }
  ]
});
```

## Advanced Relationships

### Nested Relationships
Relationships có thể được query lồng nhau:

```typescript
// Product có Category, Category có Department
registry.registerBulk({
  products: [{
    name: 'category',
    type: 'manyToOne',
    targetTable: 'categories',
    foreignKey: 'categoryId'
  }],
  
  categories: [{
    name: 'department',
    type: 'manyToOne',
    targetTable: 'departments',
    foreignKey: 'departmentId'
  }]
});

// Query: GET /api/products?select=name,category(name,department(name))
```

### Self-referential Relationships
Table có thể có relationship với chính nó:

```typescript
// Employee có manager (cũng là employee)
registry.registerFromDefinition('employees', {
  name: 'manager',
  type: 'manyToOne',
  targetTable: 'employees',
  foreignKey: 'managerId'
});

// Employee có subordinates
registry.registerFromDefinition('employees', {
  name: 'subordinates',
  type: 'oneToMany',
  targetTable: 'employees',
  foreignKey: 'managerId'
});
```

### Polymorphic Relationships
Một field có thể reference nhiều tables khác nhau:

```typescript
// Comments có thể thuộc về Posts hoặc Videos
registry.registerFromDefinition('comments', {
  name: 'commentable',
  type: 'polymorphic',
  targetField: 'commentableType',  // 'post' hoặc 'video'
  foreignKey: 'commentableId',
  targets: {
    post: 'posts',
    video: 'videos'
  }
});
```

## Relationship Options

### Filter Options
Áp dụng filter mặc định cho relationship:

```typescript
registry.registerFromDefinition('users', {
  name: 'activePosts',
  type: 'oneToMany',
  targetTable: 'posts',
  foreignKey: 'authorId',
  filter: {
    status: 'published',
    deletedAt: null
  }
});
```

### Sort Options
Định nghĩa sort order mặc định:

```typescript
registry.registerFromDefinition('posts', {
  name: 'recentComments',
  type: 'oneToMany',
  targetTable: 'comments',
  foreignKey: 'postId',
  sort: {
    createdAt: -1  // Descending
  }
});
```

### Select Options
Chỉ định fields mặc định khi populate:

```typescript
registry.registerFromDefinition('posts', {
  name: 'author',
  type: 'manyToOne',
  targetTable: 'users',
  foreignKey: 'authorId',
  select: ['name', 'email', 'avatar']  // Không lấy sensitive fields
});
```

## Integration với MongoREST Server

### 1. Khởi tạo khi start server

```typescript
import { MongoRestServer, RelationshipRegistry } from '@mongorest/core';

const server = new MongoRestServer({
  database: 'mongodb://localhost:27017/mydb'
});

// Tạo và configure registry
const registry = new RelationshipRegistry();

// Đăng ký relationships
registry.registerBulk({
  // ... your relationships
});

// Attach registry vào server
server.setRelationshipRegistry(registry);

// Start server
server.listen(3000);
```

### 2. Sử dụng với configuration file

```typescript
// relationships.config.ts
export const relationshipDefinitions = {
  users: [
    { name: 'profile', type: 'oneToOne', targetTable: 'profiles', foreignKey: 'userId' },
    { name: 'posts', type: 'oneToMany', targetTable: 'posts', foreignKey: 'authorId' }
  ],
  posts: [
    { name: 'author', type: 'manyToOne', targetTable: 'users', foreignKey: 'authorId' },
    { name: 'tags', type: 'manyToMany', targetTable: 'tags', through: 'post_tags' }
  ]
};

// server.ts
import { relationshipDefinitions } from './relationships.config';

const registry = new RelationshipRegistry();
registry.registerBulk(relationshipDefinitions);
```

## Testing Relationships

### Verify Registration
```typescript
// Kiểm tra relationship đã đăng ký
const userPostsRel = registry.get('users', 'posts');
console.log(userPostsRel); // OneToMany instance

// Lấy tất cả relationships của một table
const userRels = registry.getForTable('users');
console.log(userRels); // Map of all user relationships
```

### Query Testing
```bash
# Test OneToMany
GET /api/users/123?select=name,posts(title,content)

# Test ManyToOne
GET /api/posts?select=title,author(name,email)

# Test ManyToMany
GET /api/posts/456?select=title,tags(name,color)

# Test Nested
GET /api/posts?select=title,author(name,profile(bio))
```

## Common Patterns

### Blog System
```typescript
registry.registerBulk({
  users: [
    { name: 'posts', type: 'oneToMany', targetTable: 'posts', foreignKey: 'authorId' },
    { name: 'comments', type: 'oneToMany', targetTable: 'comments', foreignKey: 'userId' }
  ],
  posts: [
    { name: 'author', type: 'manyToOne', targetTable: 'users', foreignKey: 'authorId' },
    { name: 'comments', type: 'oneToMany', targetTable: 'comments', foreignKey: 'postId' },
    { name: 'categories', type: 'manyToMany', targetTable: 'categories', through: 'post_categories' }
  ],
  comments: [
    { name: 'user', type: 'manyToOne', targetTable: 'users', foreignKey: 'userId' },
    { name: 'post', type: 'manyToOne', targetTable: 'posts', foreignKey: 'postId' }
  ]
});
```

### E-commerce System

**Format 1: Simplified**
```typescript
registry.registerBulk({
  users: [
    { name: 'orders', type: 'oneToMany', targetTable: 'orders', foreignKey: 'userId' },
    { name: 'addresses', type: 'oneToMany', targetTable: 'addresses', foreignKey: 'userId' }
  ],
  products: [
    { name: 'category', type: 'manyToOne', targetTable: 'categories', foreignKey: 'categoryId' },
    { name: 'reviews', type: 'oneToMany', targetTable: 'reviews', foreignKey: 'productId' }
  ],
  orders: [
    { name: 'user', type: 'manyToOne', targetTable: 'users', foreignKey: 'userId' },
    { name: 'items', type: 'oneToMany', targetTable: 'order_items', foreignKey: 'orderId' }
  ],
  order_items: [
    { name: 'order', type: 'manyToOne', targetTable: 'orders', foreignKey: 'orderId' },
    { name: 'product', type: 'manyToOne', targetTable: 'products', foreignKey: 'productId' }
  ]
});
```

**Format 2: Detailed (như ví dụ của bạn)**
```typescript
registry.registerBulk({
  products: [
    {
      name: "categories",
      targetTable: "categories",
      localField: "_id",
      foreignField: "_id",
      type: "many-to-many",
      junction: {
        table: "product_categories",
        localKey: "productId",
        foreignKey: "categoryId",
      },
    },
    {
      name: "reviews",
      targetTable: "product_reviews",
      localField: "_id",
      foreignField: "productId",
      type: "one-to-many",
    },
  ],
  categories: [
    {
      name: "children",
      targetTable: "categories",
      localField: "_id",
      foreignField: "parentId",
      type: "one-to-many",
    },
    {
      name: "parent",
      targetTable: "categories",
      localField: "parentId",
      foreignField: "_id",
      type: "many-to-one",
    },
    {
      name: "products",
      targetTable: "products",
      localField: "_id",
      foreignField: "_id",
      type: "many-to-many",
      junction: {
        table: "product_categories",
        localKey: "categoryId",
        foreignKey: "productId",
      },
    },
  ],
});
```

## Troubleshooting

### Common Errors

#### "Relationship not found"
```typescript
// ❌ Wrong
const rel = registry.get('user', 'posts'); // Singular table name

// ✅ Correct
const rel = registry.get('users', 'posts'); // Plural table name
```

#### "Foreign key mismatch"
```typescript
// ❌ Wrong - foreign key không tồn tại
registry.registerFromDefinition('users', {
  name: 'posts',
  type: 'oneToMany',
  targetTable: 'posts',
  foreignKey: 'user_id'  // Field này không có trong posts
});

// ✅ Correct
registry.registerFromDefinition('users', {
  name: 'posts',
  type: 'oneToMany',
  targetTable: 'posts',
  foreignKey: 'userId'  // Field đúng trong posts
});
```

#### "Circular reference detected"
```typescript
// ❌ Avoid circular eager loading
registry.registerFromDefinition('users', {
  name: 'posts',
  type: 'oneToMany',
  targetTable: 'posts',
  foreignKey: 'userId',
  populate: ['author'] // This creates circular reference
});

// ✅ Use selective population in queries instead
GET /api/users?select=name,posts(title)
```

## Best Practices

✅ **Do:**
- Đặt tên relationship rõ ràng và nhất quán
- Sử dụng plural form cho OneToMany relationships
- Document foreign key conventions
- Test relationships sau khi đăng ký
- Sử dụng TypeScript interfaces cho type safety

❌ **Don't:**
- Tạo circular dependencies
- Hardcode relationship definitions trong business logic
- Quên validate foreign keys tồn tại
- Over-populate relationships (performance)
- Mix naming conventions

## Tóm tắt

- RelationshipRegistry quản lý tất cả relationship definitions
- Hỗ trợ 4 loại quan hệ cơ bản và advanced patterns
- Bulk registration để setup nhanh
- Integration dễ dàng với MongoREST server
- Query relationships thông qua REST API syntax

[Next: IntermediateQuery Format →](./IntermediateQuery.md)