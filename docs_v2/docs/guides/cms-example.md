# CMS Platform Example

## Giới thiệu

Hướng dẫn này trình bày cách xây dựng một Content Management System (CMS) hoàn chỉnh với MongoREST, bao gồm quản lý bài viết, phân quyền tác giả, hệ thống comments, và SEO optimization.

## 1. Thiết kế Schema

### Posts Collection

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Blog Posts",
  "collection": "posts",
  "type": "object",
  "properties": {
    "_id": {
      "type": "string",
      "description": "Post ID"
    },
    "title": {
      "type": "string",
      "minLength": 10,
      "maxLength": 200,
      "widget": "shortAnswer"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "unique": true,
      "widget": "UriKeyGen"
    },
    "content": {
      "type": "string",
      "widget": "richText",
      "features": ["bold", "italic", "link", "image", "video", "code", "quote"]
    },
    "excerpt": {
      "type": "string",
      "maxLength": 500,
      "widget": "textarea",
      "description": "Short description for listings"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published", "scheduled", "archived"],
      "default": "draft",
      "widget": "select"
    },
    "visibility": {
      "type": "string",
      "enum": ["public", "private", "password", "members"],
      "default": "public",
      "widget": "radio"
    },
    "password": {
      "type": "string",
      "widget": "password",
      "condition": "visibility=eq.password"
    },
    "authorId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "widget": "relation",
      "typeRelation": {
        "entity": "users",
        "type": "n-1",
        "displayField": "name"
      }
    },
    "publishedAt": {
      "type": "string",
      "format": "date-time",
      "widget": "dateTime"
    },
    "scheduledAt": {
      "type": "string",
      "format": "date-time",
      "widget": "dateTime",
      "condition": "status=eq.scheduled"
    },
    "featuredImage": {
      "type": "object",
      "properties": {
        "url": { "type": "string", "format": "uri" },
        "alt": { "type": "string" },
        "caption": { "type": "string" },
        "credits": { "type": "string" }
      },
      "widget": "singleImage"
    },
    "gallery": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri" },
          "alt": { "type": "string" },
          "caption": { "type": "string" }
        }
      },
      "widget": "multiImage"
    },
    "seo": {
      "type": "object",
      "properties": {
        "title": { 
          "type": "string", 
          "maxLength": 60,
          "default": "{{title}}"
        },
        "description": { 
          "type": "string", 
          "maxLength": 160,
          "default": "{{excerpt}}"
        },
        "keywords": { 
          "type": "array", 
          "items": { "type": "string" }
        },
        "ogImage": { "type": "string", "format": "uri" },
        "canonical": { "type": "string", "format": "uri" }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "allowComments": { 
          "type": "boolean", 
          "default": true,
          "widget": "boolean"
        },
        "moderateComments": { 
          "type": "boolean", 
          "default": true
        },
        "featured": { 
          "type": "boolean", 
          "default": false
        },
        "sticky": { 
          "type": "boolean", 
          "default": false
        }
      }
    },
    "metrics": {
      "type": "object",
      "properties": {
        "views": { "type": "integer", "default": 0 },
        "likes": { "type": "integer", "default": 0 },
        "shares": { "type": "integer", "default": 0 },
        "readTime": { "type": "integer", "description": "Estimated read time in minutes" }
      }
    }
  },
  "required": ["title", "content", "authorId"],
  "relationships": {
    "author": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "authorId",
      "foreignField": "_id"
    },
    "categories": {
      "type": "manyToMany",
      "collection": "categories",
      "through": "post_categories",
      "localField": "_id",
      "throughLocalField": "postId",
      "throughForeignField": "categoryId",
      "foreignField": "_id"
    },
    "tags": {
      "type": "manyToMany",
      "collection": "tags",
      "through": "post_tags",
      "localField": "_id",
      "throughLocalField": "postId",
      "throughForeignField": "tagId",
      "foreignField": "_id"
    },
    "comments": {
      "type": "hasMany",
      "collection": "comments",
      "localField": "_id",
      "foreignField": "postId",
      "defaultFilters": { "status": "approved" },
      "defaultSort": { "createdAt": -1 }
    }
  },
  "indexes": [
    { "fields": { "slug": 1 }, "unique": true },
    { "fields": { "status": 1, "publishedAt": -1 } },
    { "fields": { "authorId": 1, "status": 1 } },
    { "fields": { "title": "text", "content": "text", "excerpt": "text" } }
  ],
  "mongorest": {
    "plugins": {
      "created_at": { "isTurnOn": true },
      "updated_at": { "isTurnOn": true },
      "created_by": { "isTurnOn": true },
      "updated_by": { "isTurnOn": true }
    },
    "permissions": {
      "read": ["guest", "user", "author", "editor", "admin"],
      "create": ["author", "editor", "admin"],
      "update": ["author:own", "editor", "admin"],
      "delete": ["editor", "admin"]
    }
  }
}
```

### Categories Collection

```json
{
  "collection": "categories",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "unique": true
    },
    "description": {
      "type": "string",
      "maxLength": 200
    },
    "parentId": {
      "type": "string",
      "widget": "relation",
      "typeRelation": {
        "entity": "categories",
        "type": "n-1"
      }
    },
    "icon": {
      "type": "string",
      "widget": "icon"
    },
    "color": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "widget": "colorPicker"
    },
    "order": {
      "type": "integer",
      "default": 0
    }
  },
  "relationships": {
    "parent": {
      "type": "belongsTo",
      "collection": "categories",
      "localField": "parentId",
      "foreignField": "_id"
    },
    "children": {
      "type": "hasMany",
      "collection": "categories",
      "localField": "_id",
      "foreignField": "parentId"
    },
    "posts": {
      "type": "manyToMany",
      "collection": "posts",
      "through": "post_categories",
      "localField": "_id",
      "throughLocalField": "categoryId",
      "throughForeignField": "postId",
      "foreignField": "_id"
    }
  }
}
```

### Comments Collection

```json
{
  "collection": "comments",
  "properties": {
    "postId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "parentId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "description": "For nested comments"
    },
    "authorId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "guestAuthor": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "website": { "type": "string", "format": "uri" }
      }
    },
    "content": {
      "type": "string",
      "maxLength": 1000,
      "sanitize": "html"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "approved", "spam", "trash"],
      "default": "pending"
    },
    "likes": {
      "type": "integer",
      "default": 0
    },
    "ipAddress": {
      "type": "string",
      "security": "private"
    },
    "userAgent": {
      "type": "string",
      "security": "private"
    }
  },
  "relationships": {
    "post": {
      "type": "belongsTo",
      "collection": "posts",
      "localField": "postId",
      "foreignField": "_id"
    },
    "author": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "authorId",
      "foreignField": "_id"
    },
    "parent": {
      "type": "belongsTo",
      "collection": "comments",
      "localField": "parentId",
      "foreignField": "_id"
    },
    "replies": {
      "type": "hasMany",
      "collection": "comments",
      "localField": "_id",
      "foreignField": "parentId"
    }
  },
  "rbac_config": {
    "GET": [
      {
        "user_role": "guest",
        "patterns": [
          { "content": { "type": "string" } },
          { "authorId": { "type": "string" } },
          { "guestAuthor": { "type": "object" } },
          { "createdAt": { "type": "string" } }
        ],
        "filter": { "status": "approved" }
      }
    ],
    "POST": [
      {
        "user_role": "user",
        "patterns": [
          { "postId": { "type": "string", "required": true } },
          { "content": { "type": "string", "required": true } }
        ]
      }
    ]
  }
}
```

## 2. Content Management Features

### Post Creation & Publishing

#### Create Draft

```bash
POST /posts
{
  "title": "10 Best Practices for MongoDB Performance",
  "content": "<p>MongoDB performance optimization is crucial...</p>",
  "excerpt": "Learn how to optimize your MongoDB queries for better performance",
  "status": "draft",
  "categories": ["database", "performance"],
  "tags": ["mongodb", "optimization", "database"],
  "seo": {
    "keywords": ["mongodb performance", "database optimization", "nosql"]
  }
}
```

#### Schedule Post

```bash
POST /posts
{
  "title": "New Year Tech Predictions",
  "content": "...",
  "status": "scheduled",
  "scheduledAt": "2025-01-01T00:00:00Z",
  "settings": {
    "featured": true,
    "allowComments": true
  }
}
```

#### Auto-publish Function

```json
{
  "name": "autoPublishScheduled",
  "description": "Publish scheduled posts",
  "schedule": "*/5 * * * *",
  "steps": [
    {
      "id": "findScheduled",
      "type": "find",
      "collection": "posts",
      "query": {
        "status": "scheduled",
        "scheduledAt": { "$lte": "{{Date.now()}}" }
      }
    },
    {
      "id": "publishPosts",
      "type": "updateMany",
      "collection": "posts",
      "filter": {
        "_id": { "$in": "{{steps.findScheduled.output.map(p => p._id)}}" }
      },
      "update": {
        "$set": {
          "status": "published",
          "publishedAt": "{{Date.now()}}"
        }
      }
    },
    {
      "id": "notifySubscribers",
      "type": "forEach",
      "items": "{{steps.findScheduled.output}}",
      "action": {
        "type": "http",
        "method": "POST",
        "url": "{{env.NOTIFICATION_SERVICE}}/notify",
        "body": {
          "type": "new_post",
          "postId": "{{item._id}}",
          "title": "{{item.title}}"
        }
      }
    }
  ]
}
```

### Content Queries

#### Homepage Feed

```bash
# Latest published posts with author and category
GET /posts?and=(status=eq.published,visibility=eq.public)&select=title,slug,excerpt,publishedAt,featuredImage,author(name,avatar),categories(name,slug,color)&sort=publishedAt&order=desc&limit=10

# Featured posts
GET /posts?and=(status=eq.published,settings.featured=eq.true)&select=title,slug,featuredImage&limit=5

# Popular posts (by views)
GET /posts?and=(status=eq.published,metrics.views=gte.100)&select=title,slug,metrics&sort=metrics.views&order=desc&limit=10
```

#### Category Archive

```bash
# Posts by category with pagination
GET /posts?and=(status=eq.published)&categories.slug=eq.technology&select=title,slug,excerpt,publishedAt,author(name)&page=2&limit=20

# Category tree with post counts
GET /categories?select=name,slug,children(name,slug),postCount:posts!count&parentId=null
```

#### Search

```bash
# Full-text search
GET /posts?search=mongodb optimization&searchFields=title,content,excerpt&and=(status=eq.published)&select=title,slug,excerpt,_score&sort=_score&order=desc

# Advanced search with filters
GET /posts?search=performance&and=(status=eq.published,publishedAt=gte.2024-01-01)&categories.slug=in.(database,backend)&select=title,slug,excerpt,categories(name)
```

### Comment System

#### Load Comments

```bash
# Get approved comments for a post
GET /comments?and=(postId=eq.{{postId}},status=eq.approved,parentId=null)&select=content,createdAt,author(name,avatar),guestAuthor,replies(content,author(name),createdAt)&sort=createdAt&order=desc

# Nested comment structure
GET /comments?postId=eq.{{postId}}&select=content,author(name),replies(content,author(name),replies(content,author(name)))
```

#### Submit Comment

```bash
# Authenticated user comment
POST /comments
{
  "postId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "content": "Great article! Very helpful.",
  "parentId": null
}

# Guest comment
POST /comments
{
  "postId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "content": "Thanks for sharing!",
  "guestAuthor": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Moderate Comments

```bash
# Get pending comments (editor/admin)
GET /comments?status=eq.pending&select=content,post(title),author(name),createdAt,ipAddress

# Bulk approve
PATCH /batch/comments
{
  "filter": { "_id": { "$in": ["id1", "id2", "id3"] } },
  "update": { "status": "approved" }
}

# Mark as spam
PATCH /comments/{{commentId}}
{
  "status": "spam"
}
```

## 3. Author Dashboard

### Content Analytics

```bash
# Author's posts statistics
GET /posts?authorId=eq.{{userId}}&select=status&count=true&groupBy=status

# Response
{
  "data": {
    "draft": 15,
    "published": 48,
    "scheduled": 3,
    "archived": 12
  }
}

# Author's performance metrics
GET /functions/authorMetrics
POST /functions/authorMetrics
{
  "authorId": "{{userId}}",
  "period": "last30days"
}

# Response
{
  "totalViews": 15420,
  "totalLikes": 523,
  "totalComments": 89,
  "avgReadTime": 4.5,
  "topPosts": [
    {
      "title": "MongoDB Best Practices",
      "views": 3200,
      "engagement": 0.85
    }
  ]
}
```

### Content Calendar

```javascript
// Custom function for content calendar
{
  "name": "contentCalendar",
  "description": "Get content calendar for author",
  "input": {
    "authorId": { "type": "string" },
    "startDate": { "type": "string", "format": "date" },
    "endDate": { "type": "string", "format": "date" }
  },
  "steps": [
    {
      "id": "getScheduled",
      "type": "find",
      "collection": "posts",
      "query": {
        "authorId": "{{params.authorId}}",
        "status": { "$in": ["scheduled", "published"] },
        "$or": [
          { "scheduledAt": { "$gte": "{{params.startDate}}", "$lte": "{{params.endDate}}" } },
          { "publishedAt": { "$gte": "{{params.startDate}}", "$lte": "{{params.endDate}}" } }
        ]
      }
    },
    {
      "id": "formatCalendar",
      "type": "transform",
      "data": "{{steps.getScheduled.output}}",
      "format": "calendar"
    }
  ]
}
```

## 4. Media Management

### Media Library

```json
{
  "collection": "media",
  "properties": {
    "filename": { "type": "string" },
    "url": { "type": "string", "format": "uri" },
    "type": { "type": "string", "enum": ["image", "video", "document"] },
    "mimeType": { "type": "string" },
    "size": { "type": "integer" },
    "dimensions": {
      "type": "object",
      "properties": {
        "width": { "type": "integer" },
        "height": { "type": "integer" }
      }
    },
    "thumbnails": {
      "type": "object",
      "properties": {
        "small": { "type": "string", "format": "uri" },
        "medium": { "type": "string", "format": "uri" },
        "large": { "type": "string", "format": "uri" }
      }
    },
    "alt": { "type": "string" },
    "caption": { "type": "string" },
    "uploadedBy": { "type": "string" }
  }
}
```

### Image Processing

```javascript
// Function for image optimization
{
  "name": "processImage",
  "description": "Process uploaded image",
  "steps": [
    {
      "id": "generateThumbnails",
      "type": "http",
      "method": "POST",
      "url": "{{env.IMAGE_SERVICE}}/resize",
      "body": {
        "source": "{{params.url}}",
        "sizes": [
          { "name": "small", "width": 150, "height": 150 },
          { "name": "medium", "width": 300, "height": 300 },
          { "name": "large", "width": 800, "height": 800 }
        ]
      }
    },
    {
      "id": "saveMedia",
      "type": "insert",
      "collection": "media",
      "document": {
        "filename": "{{params.filename}}",
        "url": "{{params.url}}",
        "type": "image",
        "thumbnails": "{{steps.generateThumbnails.output}}",
        "uploadedBy": "{{user.id}}"
      }
    }
  ]
}
```

## 5. SEO & Performance

### SEO Optimization

```javascript
// Auto-generate SEO metadata
{
  "name": "generateSEO",
  "description": "Generate SEO metadata for posts",
  "triggers": ["before_create", "before_update"],
  "steps": [
    {
      "id": "generateMeta",
      "type": "transform",
      "input": "{{document}}",
      "operations": [
        {
          "if": "!document.seo.title",
          "set": "document.seo.title",
          "value": "{{document.title | truncate:60}}"
        },
        {
          "if": "!document.seo.description",
          "set": "document.seo.description",
          "value": "{{document.excerpt | truncate:160}}"
        },
        {
          "if": "!document.slug",
          "set": "document.slug",
          "value": "{{document.title | slugify}}"
        }
      ]
    },
    {
      "id": "calculateReadTime",
      "type": "calculate",
      "formula": "Math.ceil({{document.content | wordCount}} / 200)",
      "output": "document.metrics.readTime"
    }
  ]
}
```

### Sitemap Generation

```bash
# Get all published posts for sitemap
GET /posts?status=eq.published&select=slug,updatedAt&limit=1000

# Generate sitemap.xml
GET /functions/generateSitemap
```

### Performance Caching

```javascript
// Cache configuration
{
  "caching": {
    "posts": {
      "list": {
        "ttl": 300,
        "keyPattern": "posts:list:{status}:{category}:{page}"
      },
      "detail": {
        "ttl": 3600,
        "keyPattern": "posts:detail:{slug}",
        "invalidateOn": ["update", "delete"]
      }
    },
    "categories": {
      "tree": {
        "ttl": 86400,
        "key": "categories:tree"
      }
    }
  }
}
```

## 6. Multi-language Support

### Language Schema

```json
{
  "collection": "translations",
  "properties": {
    "postId": { "type": "string" },
    "language": { "type": "string", "enum": ["en", "vi", "fr", "es"] },
    "title": { "type": "string" },
    "content": { "type": "string" },
    "excerpt": { "type": "string" },
    "seo": { "type": "object" }
  },
  "indexes": [
    { "fields": { "postId": 1, "language": 1 }, "unique": true }
  ]
}
```

### Multi-language Queries

```bash
# Get post with translations
GET /posts/{{postId}}?select=*,translations(language,title,excerpt)

# Get posts by language
GET /posts?translations.language=eq.vi&select=title,slug,translations(title,excerpt)!filter.language.eq.vi
```

## 7. Workflow & Permissions

### Editorial Workflow

```javascript
// Content approval workflow
{
  "name": "submitForReview",
  "permissions": ["author"],
  "steps": [
    {
      "id": "updateStatus",
      "type": "update",
      "collection": "posts",
      "filter": { "_id": "{{params.postId}}", "authorId": "{{user.id}}" },
      "update": {
        "$set": {
          "status": "pending_review",
          "submittedAt": "{{Date.now()}}"
        }
      }
    },
    {
      "id": "notifyEditors",
      "type": "notification",
      "recipients": { "role": "editor" },
      "template": "post_review_request",
      "data": {
        "postId": "{{params.postId}}",
        "authorName": "{{user.name}}"
      }
    }
  ]
}
```

### Role-based Permissions

```javascript
// RBAC configuration for CMS
{
  "roles": {
    "author": {
      "posts": {
        "create": true,
        "read": "own",
        "update": "own",
        "delete": false
      },
      "media": {
        "create": true,
        "read": true,
        "delete": "own"
      }
    },
    "editor": {
      "posts": {
        "create": true,
        "read": true,
        "update": true,
        "delete": false,
        "publish": true
      },
      "comments": {
        "moderate": true
      }
    },
    "admin": {
      "*": true
    }
  }
}
```

## 8. Monitoring & Analytics

### Content Performance

```javascript
// Track post views
{
  "name": "trackView",
  "description": "Track post view",
  "rateLimit": { "ip": "1/minute" },
  "steps": [
    {
      "id": "incrementView",
      "type": "update",
      "collection": "posts",
      "filter": { "_id": "{{params.postId}}" },
      "update": { "$inc": { "metrics.views": 1 } }
    },
    {
      "id": "logView",
      "type": "insert",
      "collection": "analytics",
      "document": {
        "event": "post_view",
        "postId": "{{params.postId}}",
        "userId": "{{user.id}}",
        "ip": "{{request.ip}}",
        "userAgent": "{{request.userAgent}}",
        "timestamp": "{{Date.now()}}"
      }
    }
  ]
}
```

### Analytics Dashboard

```bash
# Content performance overview
GET /functions/contentAnalytics
{
  "period": "last30days",
  "metrics": ["views", "engagement", "shares"]
}

# Author leaderboard
GET /functions/authorLeaderboard
{
  "metric": "views",
  "period": "thisMonth"
}
```

## Conclusion

MongoREST cung cấp một platform mạnh mẽ cho việc xây dựng CMS với đầy đủ tính năng. Với schema-driven approach, bạn có thể nhanh chóng tạo ra một hệ thống quản lý nội dung chuyên nghiệp với editorial workflow, multi-language support, và advanced analytics.

### Next Steps

- Explore [Analytics Example](./analytics-example.md) for advanced reporting
- Read [Migration Guide](./migration-guide.md) to migrate existing CMS
- Check [E-commerce Example](./e-commerce-example.md) for product content management