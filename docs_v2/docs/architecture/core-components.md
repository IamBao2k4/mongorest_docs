---
sidebar_position: 2
---

# Core Components

MongoREST được xây dựng từ nhiều components chuyên biệt, mỗi component đảm nhận một responsibility cụ thể. Trang này mô tả chi tiết từng core component.

## 1. Schema Loader

Schema Loader chịu trách nhiệm load và quản lý tất cả JSON schemas.

### Responsibilities

- Load schemas từ file system
- Validate schema syntax
- Cache schemas trong memory
- Hot-reload trong development

### Implementation

```javascript
class SchemaLoader {
  private schemas: Map<string, Schema> = new Map()
  private validators: Map<string, ValidateFunction> = new Map()
  
  async loadSchemas(directory: string) {
    const files = await fs.readdir(directory)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(directory, file))
        const schema = JSON.parse(content)
        
        // Validate schema structure
        this.validateSchemaStructure(schema)
        
        // Compile validator
        const validator = ajv.compile(schema)
        
        // Cache
        this.schemas.set(schema.collection, schema)
        this.validators.set(schema.collection, validator)
      }
    }
  }
  
  getSchema(collection: string): Schema {
    const schema = this.schemas.get(collection)
    if (!schema) {
      throw new NotFoundError(`Schema for ${collection} not found`)
    }
    return schema
  }
}
```

### Configuration

```javascript
const loader = new SchemaLoader({
  directory: './schemas/collections',
  watch: process.env.NODE_ENV === 'development',
  validateOnLoad: true
})
```
## 2. CRUD Generator

CRUD Generator tự động tạo RESTful endpoints từ schemas.

### Generated Endpoints

```javascript
// For each collection, generate:
GET    /crud/{collection}        // List với filtering
GET    /crud/{collection}/{id}   // Get single document  
POST   /crud/{collection}        // Create new
PUT    /crud/{collection}/{id}   // Full update
PATCH  /crud/{collection}/{id}   // Partial update
DELETE /crud/{collection}/{id}   // Delete
```

### Query Features

```javascript
// Supported query parameters
interface QueryParams {
  // Filtering
  [field: string]: string  // field=eq.value
  
  // Selection
  select?: string         // select=name,price,category(name)
  
  // Sorting
  sort?: string          // sort=createdAt
  order?: 'asc' | 'desc' // order=desc
  
  // Pagination
  page?: number          // page=2
  limit?: number         // limit=50
  
  // Search
  search?: string        // search=keyword
  searchFields?: string  // searchFields=name,description
  
  // Special
  count?: boolean        // count=true
  dryRun?: boolean      // dryRun=true
  debug?: boolean       // debug=true
}
```

## 3. Relationship System

Xử lý relationships giữa collections một cách tự động.

### Relationship Types

#### BelongsTo (N-1)

```javascript
// Schema definition
{
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "categories",
      "localField": "categoryId",
      "foreignField": "_id"
    }
  }
}

// Query
GET /products?select=name,category(name,slug)

// Generated pipeline
[
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $addFields: {
      category: { $arrayElemAt: ["$category", 0] }
    }
  }
]
```

#### HasMany (1-N)

```javascript
// Schema definition
{
  "relationships": {
    "orders": {
      "type": "hasMany",
      "collection": "orders",
      "localField": "_id",
      "foreignField": "userId",
      "defaultSort": { "createdAt": -1 },
      "pagination": {
        "defaultLimit": 20,
        "maxLimit": 100
      }
    }
  }
}

// Query
GET /users?select=name,orders(orderNumber,total)!limit.5

// Generated pipeline with sub-pipeline
[
  {
    $lookup: {
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        { $project: { orderNumber: 1, total: 1 } }
      ],
      as: "orders"
    }
  }
]
```

#### ManyToMany (N-N)

```javascript
// Schema definition
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

// Query
GET /products?select=name,categories(name,slug)

// Generated two-stage lookup
[
  {
    $lookup: {
      from: "product_categories",
      localField: "_id",
      foreignField: "productId",
      as: "_categories_junction"
    }
  },
  {
    $lookup: {
      from: "categories",
      localField: "_categories_junction.categoryId",
      foreignField: "_id",
      as: "categories"
    }
  },
  {
    $project: {
      _categories_junction: 0  // Remove junction data
    }
  }
]
```

### Relationship Parser

```javascript
class RelationshipParser {
  parse(selectString: string): RelationshipTree {
    // Parse: "name,author(name,email),comments(text,user(name))"
    const tree = this.buildTree(selectString)
    return this.validateRelationships(tree)
  }
  
  private buildTree(str: string): RelationshipTree {
    const tokens = this.tokenize(str)
    return this.parseTokens(tokens)
  }
  
  private tokenize(str: string): Token[] {
    // Tokenize into: field, (, ), comma
    const regex = /([a-zA-Z_][a-zA-Z0-9_]*)|(\()|(\))|(\,)/g
    return str.match(regex) || []
  }
}
```

## 4. Query Converter Service

Chuyển đổi API parameters thành MongoDB queries.

### Filter Parsing

```javascript
class QueryConverter {
  convertFilter(params: QueryParams): MongoFilter {
    const filter = {}
    
    for (const [key, value] of Object.entries(params)) {
      // Skip special params
      if (SPECIAL_PARAMS.includes(key)) continue
      
      // Parse operator and value
      const [operator, ...valueParts] = value.split('.')
      const actualValue = valueParts.join('.')
      
      // Apply operator
      filter[key] = this.applyOperator(operator, actualValue)
    }
    
    return filter
  }
  
  private applyOperator(op: string, value: string): any {
    switch (op) {
      case 'eq': return value
      case 'neq': return { $ne: value }
      case 'gt': return { $gt: this.parseValue(value) }
      case 'gte': return { $gte: this.parseValue(value) }
      case 'lt': return { $lt: this.parseValue(value) }
      case 'lte': return { $lte: this.parseValue(value) }
      case 'in': return { $in: this.parseArray(value) }
      case 'nin': return { $nin: this.parseArray(value) }
      case 'like': return { $regex: value, $options: 'i' }
      case 'regex': return { $regex: value }
      case 'exists': return { $exists: value === 'true' }
      case 'null': return value === 'true' ? null : { $ne: null }
      default: throw new Error(`Unknown operator: ${op}`)
    }
  }
}
```

### Aggregation Builder

```javascript
class AggregationBuilder {
  build(collection: string, options: QueryOptions): Pipeline {
    const pipeline = []
    
    // 1. Early filtering
    if (options.filter) {
      pipeline.push({ $match: options.filter })
    }
    
    // 2. Relationships
    if (options.relationships) {
      for (const rel of options.relationships) {
        pipeline.push(...this.buildRelationshipStages(rel))
      }
    }
    
    // 3. Field projection
    if (options.select) {
      pipeline.push({ $project: options.select })
    }
    
    // 4. Sorting
    if (options.sort) {
      pipeline.push({ $sort: options.sort })
    }
    
    // 5. Pagination
    if (options.skip) {
      pipeline.push({ $skip: options.skip })
    }
    if (options.limit) {
      pipeline.push({ $limit: options.limit })
    }
    
    return pipeline
  }
}
```
## Component Lifecycle

### Initialization

```javascript
// 1. Load configuration
const config = await loadConfig()

// 2. Connect to database
const db = await connectMongoDB(config.mongodb)

// 3. Load schemas
const schemaLoader = new SchemaLoader()
await schemaLoader.loadSchemas(config.schemaDir)

// 4. Initialize services
const validator = new Validator(schemaLoader)
const queryConverter = new QueryConverter()
const crudService = new CrudService(db, validator, queryConverter)

// 5. Generate routes
const crudGenerator = new CrudGenerator(crudService)
for (const schema of schemaLoader.getAllSchemas()) {
  crudGenerator.generateRoutes(app, schema)
}

// 6. Start server
await app.listen(config.port)
```

### Request Processing

```javascript
// 1. Request arrives
// 2. JWT authentication
// 3. RBAC check
// 4. Parse query parameters
// 5. Validate input
// 6. Execute business logic
// 7. Apply field filtering
// 8. Return response
```

## Next Steps

Understanding core components helps you:
- 🔧 Extend functionality
- 🐛 Debug issues
- ⚡ Optimize performance
- 🏗️ Build custom features

Continue to: [Data Flow →](./data-flow)
