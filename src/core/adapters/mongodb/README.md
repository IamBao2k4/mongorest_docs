# MongoDB Adapter

The MongoDB adapter provides a comprehensive interface for converting intermediate queries to MongoDB operations and managing entity configurations.

## Architecture

```
mongodb/
├── converters/          # Query conversion logic
│   ├── FilterConverter.ts
│   ├── JoinConverter.ts
│   └── QueryConverter.ts
├── managers/           # Entity and connection management
│   └── EntityManager.ts
├── types/             # TypeScript interfaces
│   └── index.ts
└── mongodbAdapter.ts  # Main adapter class
```

## Features

### 1. Entity Management
- Automatic loading and caching of entity configurations from `_entities.json`
- File watching for real-time updates
- Collection whitelist validation
- Schema validation support

### 2. Query Conversion
- Converts intermediate queries to MongoDB aggregation pipelines
- Supports CRUD operations (insert, update, delete, read)
- Complex filter conditions with logical operators
- Join operations with relationship support

### 3. Connection Management
- MongoDB client initialization
- Database connection pooling
- Collection access with validation
- Change stream support

## Usage

### Basic Setup

```typescript
import { MongoDBAdapter } from '@core/adapters/mongodb';
import { MongoClient } from 'mongodb';

// Create adapter instance
const adapter = new MongoDBAdapter();

// Initialize with connection
await adapter.initialize({
  connection: {
    connectionString: 'mongodb://localhost:27017/mydb'
  }
});
```

### Entity Configuration

Entities are configured in `json/entities/_entities.json`:

```json
{
  "documents": [
    {
      "_id": "unique_id",
      "title": "User Collection",
      "mongodb_collection_name": "users",
      "json_schema": {
        "type": "object",
        "properties": {
          "email": { "type": "string" },
          "name": { "type": "string" }
        }
      }
    }
  ]
}
```

### Query Examples

#### Read Query
```typescript
const query: IntermediateQuery = {
  type: 'read',
  collection: 'users',
  filter: {
    conditions: [
      { field: 'status', operator: 'eq', value: 'active' }
    ]
  },
  pagination: {
    limit: 10,
    offset: 0
  }
};

const mongoQuery = adapter.convertQuery(query);
const result = await adapter.executeQuery(mongoQuery);
```

#### Insert Query
```typescript
const query: IntermediateQuery = {
  type: 'insert',
  collection: 'users',
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  }
};

const mongoQuery = adapter.convertQuery(query);
const result = await adapter.executeQuery(mongoQuery);
```

#### Join Query
```typescript
const query: IntermediateQuery = {
  type: 'read',
  collection: 'orders',
  joins: [
    {
      type: 'left',
      target: 'users',
      on: [
        { local: 'userId', foreign: '_id' }
      ],
      alias: 'user'
    }
  ]
};

const mongoQuery = adapter.convertQuery(query);
const result = await adapter.executeQuery(mongoQuery);
```

## API Reference

### MongoDBAdapter

#### Constructor
```typescript
constructor(relationshipRegistry?: RelationshipRegistry, entitiesFilePath?: string)
```

#### Methods

##### initialize(config: AdapterConfig): Promise<void>
Initialize the adapter with MongoDB connection.

##### convertQuery(query: IntermediateQuery): MongoDBQuery
Convert intermediate query to MongoDB operation.

##### executeQuery<T>(nativeQuery: MongoDBQuery, options?: ExecutionOptions): Promise<IntermediateQueryResult<T>>
Execute MongoDB query and return results.

##### validateQuery(query: IntermediateQuery): ValidationResult
Validate query before conversion.

##### getCapabilities(): AdapterCapabilities
Get adapter capabilities and supported features.

### EntityManager

#### Methods

##### getCollection(collectionName: string): Promise<Collection>
Get MongoDB collection with validation.

##### createCollectionWithSchema(collectionName: string, schema: any): Promise<void>
Create collection with JSON Schema validation.

##### updateCollectionSchema(collectionName: string, schema: any): Promise<void>
Update schema validation for existing collection.

##### watchCollection(collectionName: string, targetCollectionName: string, type: string): Promise<void>
Watch collection changes and sync to target collection.

##### isCollectionAllowed(collectionName: string): boolean
Check if collection is registered in entities.

### Filter Operators

Supported MongoDB filter operators:
- `eq`: Equal
- `neq`: Not equal
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `in`: In array
- `nin`: Not in array
- `exists`: Field exists
- `null`: Is null
- `notnull`: Is not null
- `regex`: Regular expression
- `like`/`ilike`: SQL-like pattern matching
- `contains`: Contains substring
- `startswith`: Starts with string
- `endswith`: Ends with string

### Join Types

Supported join types:
- `lookup`: Basic MongoDB $lookup
- `left`: Left outer join
- `inner`: Inner join (with unwind)
- `one-to-one`: One-to-one relationship
- `one-to-many`: One-to-many relationship
- `many-to-one`: Many-to-one relationship
- `many-to-many`: Many-to-many with junction table

## Configuration

### Environment Variables
```bash
# MongoDB connection
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=mydb
MONGO_OPTIONS=?authSource=admin

# Entities file path (optional)
ENTITIES_FILE_PATH=/path/to/_entities.json
```

### Collection Validation

Collections must be registered in `_entities.json` before use. Special collections that bypass validation:
- `entity` or `_entities`: Management collection

### Schema Validation

MongoDB native JSON Schema validation can be applied:

```typescript
const schema = {
  bsonType: "object",
  required: ["name", "email"],
  properties: {
    name: { bsonType: "string" },
    email: { 
      bsonType: "string",
      pattern: "^.+@.+$"
    }
  }
};

await adapter.createCollectionWithSchema('users', schema);
```

## Error Handling

Common errors and solutions:

### COLLECTION_NOT_REGISTERED
```
Collection 'xyz' is not registered in entities
```
**Solution**: Add collection to `_entities.json`

### Invalid Query Structure
```
Invalid intermediate query structure
```
**Solution**: Ensure query follows IntermediateQuery interface

### Connection Errors
```
MongoDB connection not available
```
**Solution**: Check connection string and MongoDB server status

## Performance Considerations

1. **Entity Caching**: Entities are cached in memory and updated via file watching
2. **Connection Pooling**: MongoDB driver handles connection pooling
3. **Aggregation Pipeline**: Complex queries use aggregation pipeline for efficiency
4. **Indexes**: Ensure proper indexes for filter fields

## Testing

Run tests:
```bash
npm test src/core/adapters/mongodb
```

## Contributing

1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure TypeScript types are properly defined