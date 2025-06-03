# PostgREST to MongoDB Query Converter

A TypeScript library that converts PostgREST query parameters to MongoDB query format. This library helps bridge the gap between PostgreSQL REST APIs and MongoDB databases by translating query syntax.

## Features

- **Complete Operator Support**: All PostgREST operators (eq, neq, gt, gte, lt, lte, like, ilike, etc.)
- **Logical Operations**: Support for AND, OR, and NOT operations
- **Array Operations**: Handle IN, contains, overlap operations
- **Pattern Matching**: LIKE and regex pattern support with wildcards
- **Null Handling**: Proper null and not_null checks
- **Projection**: SELECT clause conversion to MongoDB projection
- **Sorting**: ORDER BY conversion to MongoDB sort
- **Modular Design**: Clean separation of concerns with individual operator classes
- **Full Test Coverage**: Comprehensive test suite included

## Installation

```bash
npm install postgrest-mongo-converter
```

## Quick Start

```typescript
import { PostgRESTToMongoConverter } from 'postgrest-mongo-converter';

const converter = new PostgRESTToMongoConverter();

// Convert PostgREST query parameters
const params = {
  age: 'gte.18',
  status: 'eq.active',
  select: 'id,name,email',
  order: 'created_at.desc'
};

const mongoQuery = converter.convert(params);
console.log(mongoQuery);
```

Output:
```javascript
{
  filter: {
    $and: [
      { age: { $gte: 18 } },
      { status: 'active' }
    ]
  },
  projection: {
    id: 1,
    name: 1,
    email: 1
  },
  sort: {
    created_at: -1
  }
}
```

## Supported Operators

### Comparison Operators

| PostgREST | MongoDB | Example |
|-----------|---------|---------|
| `eq` | `$eq` (implicit) | `age=eq.25` → `{age: 25}` |
| `neq` | `$ne` | `status=neq.inactive` → `{status: {$ne: "inactive"}}` |
| `gt` | `$gt` | `score=gt.80` → `{score: {$gt: 80}}` |
| `gte` | `$gte` | `age=gte.18` → `{age: {$gte: 18}}` |
| `lt` | `$lt` | `price=lt.100` → `{price: {$lt: 100}}` |
| `lte` | `$lte` | `rating=lte.5` → `{rating: {$lte: 5}}` |

### Text Operators

| PostgREST | MongoDB | Example |
|-----------|---------|---------|
| `like` | `$regex` | `name=like.John*` → `{name: {$regex: "John.*", $options: "i"}}` |
| `ilike` | `$regex` (case-insensitive) | `email=ilike.*@gmail.*` → `{email: {$regex: ".*@gmail.*", $options: "i"}}` |
| `match` | `$regex` | `code=match.^[A-Z]{3}$` → `{code: {$regex: "^[A-Z]{3}$"}}` |
| `imatch` | `$regex` (case-insensitive) | `pattern=imatch.^test.*` → `{pattern: {$regex: "^test.*", $options: "i"}}` |

### Array Operators

| PostgREST | MongoDB | Example |
|-----------|---------|---------|
| `in` | `$in` | `status=in.(active,pending)` → `{status: {$in: ["active", "pending"]}}` |
| `cs` (contains) | `$all` | `tags=cs.{js,react}` → `{tags: {$all: ["js", "react"]}}` |
| `cd` (contained in) | `$in` | `category=cd.{tech,news}` → `{category: {$in: ["tech", "news"]}}` |
| `ov` (overlap) | `$elemMatch` | `skills=ov.{js,python}` → `{skills: {$elemMatch: {$in: ["js", "python"]}}}` |

### Null Operators

| PostgREST | MongoDB | Example |
|-----------|---------|---------|
| `is.null` | `null` | `description=is.null` → `{description: null}` |
| `is.not_null` | `$ne: null` | `title=is.not_null` → `{title: {$ne: null}}` |
| `is.true` | `true` | `active=is.true` → `{active: true}` |
| `is.false` | `false` | `verified=is.false` → `{verified: false}` |

## Logical Operations

### OR Operations
```typescript
// PostgREST: or=(age.lt.18,age.gt.65)
const params = { or: '(age.lt.18,age.gt.65)' };
// MongoDB: { $or: [{ age: { $lt: 18 } }, { age: { $gt: 65 } }] }
```

### AND Operations
```typescript
// PostgREST: and=(age.gte.18,age.lte.65)
const params = { and: '(age.gte.18,age.lte.65)' };
// MongoDB: { $and: [{ age: { $gte: 18 } }, { age: { $lte: 65 } }] }
```

### NOT Operations
```typescript
// PostgREST: not.age.eq.25
const params = { 'not.age.eq.25': '' };
// MongoDB: { $not: { age: 25 } }
```

## Modifier Operations

### ANY Modifier
```typescript
// PostgREST: name=like(any).{John*,Jane*}
const params = { name: 'like(any).{John*,Jane*}' };
// MongoDB: { $or: [
//   { name: { $regex: "John.*", $options: "i" } },
//   { name: { $regex: "Jane.*", $options: "i" } }
// ]}
```

### ALL Modifier
```typescript
// PostgREST: tags=like(all).{tech*,*script}
const params = { tags: 'like(all).{tech*,*script}' };
// MongoDB: { $and: [
//   { tags: { $regex: "tech.*", $options: "i" } },
//   { tags: { $regex: ".*script", $options: "i" } }
// ]}
```

## Select and Order

### Projection (Select)
```typescript
// PostgREST: select=id,name,email
const params = { 
  name: 'eq.John',
  select: 'id,name,email' 
};
// Result: { 
//   filter: { name: 'John' },
//   projection: { id: 1, name: 1, email: 1 }
// }
```

### Aliased Fields
```typescript
// PostgREST: select=fullName:full_name,birthDate:birth_date
const params = { select: 'fullName:full_name,birthDate:birth_date' };
// Result: { projection: { full_name: 1, birth_date: 1 } }
```

### Sorting (Order)
```typescript
// PostgREST: order=age.desc,name.asc
const params = { 
  age: 'gte.18',
  order: 'age.desc,name.asc' 
};
// Result: { 
//   filter: { age: { $gte: 18 } },
//   sort: { age: -1, name: 1 }
// }
```

## Real World Examples

### User Search
```typescript
// GET /users?age=gte.18&status=eq.active&select=id,name,email&order=created_at.desc
const params = {
  age: 'gte.18',
  status: 'eq.active',
  select: 'id,name,email',
  order: 'created_at.desc'
};

const mongoQuery = converter.convert(params);
// Result:
// {
//   filter: {
//     $and: [
//       { age: { $gte: 18 } },
//       { status: 'active' }
//     ]
//   },
//   projection: { id: 1, name: 1, email: 1 },
//   sort: { created_at: -1 }
// }
```

### Product Search
```typescript
// GET /products?price=gte.10&category=in.(electronics,clothing)&available=eq.true
const params = {
  price: 'gte.10',
  category: 'in.(electronics,clothing)',
  available: 'eq.true'
};

const mongoQuery = converter.convert(params);
// Result:
// {
//   filter: {
//     $and: [
//       { price: { $gte: 10 } },
//       { category: { $in: ['electronics', 'clothing'] } },
//       { available: true }
//     ]
//   }
// }
```

### Blog Post Search with OR Logic
```typescript
// GET /posts?or=(published.eq.true,author_id.eq.123)&tags=cs.{tech,javascript}
const params = {
  or: '(published.eq.true,author_id.eq.123)',
  tags: 'cs.{tech,javascript}'
};

const mongoQuery = converter.convert(params);
// Result:
// {
//   filter: {
//     $and: [
//       {
//         $or: [
//           { published: true },
//           { author_id: 123 }
//         ]
//       },
//       { tags: { $all: ['tech', 'javascript'] } }
//     ]
//   }
// }
```

### Pattern Matching Search
```typescript
// GET /articles?title=like.*JavaScript*&author=neq.anonymous&word_count=gt.1000
const params = {
  title: 'like.*JavaScript*',
  author: 'neq.anonymous',
  word_count: 'gt.1000'
};

const mongoQuery = converter.convert(params);
// Result:
// {
//   filter: {
//     $and: [
//       { title: { $regex: '.*JavaScript.*', $options: 'i' } },
//       { author: { $ne: 'anonymous' } },
//       { word_count: { $gt: 1000 } }
//     ]
//   }
// }
```

## Advanced Usage

### Using Individual Parsers

You can use individual parsers for specific functionality:

```typescript
import { FilterParser, SelectParser, OrderParser } from 'postgrest-mongo-converter';

// Filter parsing only
const filterParser = new FilterParser();
const filter = filterParser.parseFilter('age', 'gte.18');
const mongoFilter = filterParser.convertFilter(filter);

// Select parsing only
const selectParser = new SelectParser();
const projection = selectParser.parseSelect('id,name,email');

// Order parsing only
const orderParser = new OrderParser();
const sort = orderParser.parseOrder('age.desc,name.asc');
```

### Creating Custom Operators

```typescript
import { BaseOperator } from 'postgrest-mongo-converter';

class CustomOperator extends BaseOperator {
  readonly name = 'custom';
  
  convert(field: string, value: any): Record<string, any> {
    // Your custom logic here
    return { [field]: { $custom: this.parseValue(value) } };
  }
}

// Register with FilterParser
const filterParser = new FilterParser();
filterParser.registerOperator(new CustomOperator());
```

### Extending Logical Operations

```typescript
import { LogicalParser } from 'postgrest-mongo-converter';

class CustomLogicalParser extends LogicalParser {
  parseLogical(expression: string): any {
    if (expression.startsWith('custom=')) {
      // Handle custom logical operation
      return this.parseCustom(expression.substring(7));
    }
    return super.parseLogical(expression);
  }
  
  private parseCustom(expression: string): Record<string, any> {
    // Your custom logical operation
    return { $custom: expression };
  }
}
```

## MongoDB Integration

### Using with MongoDB Node.js Driver

```typescript
import { MongoClient } from 'mongodb';
import { PostgRESTToMongoConverter } from 'postgrest-mongo-converter';

const converter = new PostgRESTToMongoConverter();
const client = new MongoClient('mongodb://localhost:27017');

async function findUsers(queryParams: Record<string, string>) {
  const mongoQuery = converter.convert(queryParams);
  const db = client.db('myapp');
  const collection = db.collection('users');
  
  let query = collection.find(mongoQuery.filter);
  
  if (mongoQuery.projection) {
    query = query.project(mongoQuery.projection);
  }
  
  if (mongoQuery.sort) {
    query = query.sort(mongoQuery.sort);
  }
  
  return await query.toArray();
}

// Usage
const users = await findUsers({
  age: 'gte.18',
  status: 'eq.active',
  select: 'id,name,email',
  order: 'created_at.desc'
});
```

### Using with Mongoose

```typescript
import mongoose from 'mongoose';
import { PostgRESTToMongoConverter } from 'postgrest-mongo-converter';

const converter = new PostgRESTToMongoConverter();

async function findDocuments(Model: mongoose.Model<any>, queryParams: Record<string, string>) {
  const mongoQuery = converter.convert(queryParams);
  
  let query = Model.find(mongoQuery.filter);
  
  if (mongoQuery.projection) {
    query = query.select(mongoQuery.projection);
  }
  
  if (mongoQuery.sort) {
    query = query.sort(mongoQuery.sort);
  }
  
  return await query.exec();
}
```

## API Reference

### PostgRESTToMongoConverter

Main converter class that orchestrates all parsing operations.

#### Methods

- `convert(params: QueryParams): MongoQuery` - Converts PostgREST parameters to MongoDB query

### FilterParser

Handles filter expression parsing and conversion.

#### Methods

- `parseFilter(field: string, expression: string): ParsedFilter` - Parse filter expression
- `convertFilter(filter: ParsedFilter): Record<string, any>` - Convert to MongoDB filter

### LogicalParser

Handles logical operations (AND, OR, NOT).

#### Methods

- `parseLogical(expression: string): any` - Parse logical expression

### SelectParser

Handles SELECT clause parsing for projection.

#### Methods

- `parseSelect(selectClause: string): Record<string, 1 | 0>` - Parse select clause

### OrderParser

Handles ORDER BY clause parsing.

#### Methods

- `parseOrder(orderClause: string): Record<string, 1 | -1>` - Parse order clause

### BaseOperator

Abstract base class for all operators.

#### Methods

- `convert(field: string, value: any): Record<string, any>` - Convert operator to MongoDB query
- `parseValue(value: string): any` - Parse string value to appropriate type
- `parseArray(value: string): any[]` - Parse array format values

## Data Type Handling

The converter automatically handles data type conversion:

- **Numbers**: String numbers are converted to numeric types
- **Booleans**: `'true'` and `'false'` strings are converted to boolean
- **Null**: `'null'` string is converted to `null`
- **Arrays**: Array formats `(1,2,3)` and `{1,2,3}` are parsed to arrays
- **Strings**: Other values remain as strings

```typescript
// Examples of type conversion
'25' → 25
'true' → true
'false' → false
'null' → null
'(1,2,3)' → [1, 2, 3]
'{active,pending}' → ['active', 'pending']
'hello' → 'hello'
```

## Limitations and Considerations

### PostgreSQL vs MongoDB Differences

1. **Full-Text Search**: PostgREST's `fts`, `plfts`, `phfts`, `wfts` operators are not supported as MongoDB uses different text search syntax
2. **Range Operations**: PostgREST's range operators (`sl`, `sr`, `nxr`, `nxl`, `adj`) are not directly supported
3. **JSON Path**: Simplified JSON path support (MongoDB has different JSON querying syntax)
4. **Null Sorting**: PostgreSQL's `nullsfirst`/`nullslast` are ignored as MongoDB handles nulls differently

### Performance Considerations

1. **Index Usage**: Ensure MongoDB indexes match the converted query patterns
2. **Regex Performance**: Text search operators convert to regex which may be slower than MongoDB's text indexes
3. **Complex Queries**: Very complex logical operations may generate deeply nested MongoDB queries

### Migration Notes

When migrating from PostgREST to MongoDB:

1. **Review Indexes**: Create appropriate MongoDB indexes for your query patterns
2. **Test Performance**: Benchmark converted queries against your dataset
3. **Full-Text Search**: Consider using MongoDB's text indexes instead of regex for text search
4. **Aggregation**: Complex queries might benefit from MongoDB's aggregation pipeline

## Testing

Run the test suite:

```bash
npm test
```

The library includes comprehensive tests covering:

- All operator types
- Logical operations
- Parser functionality
- Real-world examples
- Edge cases and error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial release
- Support for all basic PostgREST operators
- Logical operations (AND, OR, NOT)
- Select and Order clause support
- Comprehensive test suite
- TypeScript support

## Support

For questions, issues, or contributions:

- GitHub Issues: [Create an issue](https://github.com/yourorg/postgrest-mongo-converter/issues)
- Documentation: [Read the docs](https://github.com/yourorg/postgrest-mongo-converter#readme)
- Examples: [View examples](https://github.com/yourorg/postgrest-mongo-converter/tree/main/examples)