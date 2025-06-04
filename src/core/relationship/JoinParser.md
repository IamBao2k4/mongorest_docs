# JoinParser Documentation

## Overview

The `JoinParser` class handles parsing and processing of embedding expressions for MongoDB relationships. It converts REST-style embedding syntax into MongoDB aggregation pipeline stages.

## Class Structure

```typescript
class JoinParser {
  private registry: RelationshipRegistry;
}
```

## Constructor

```typescript
constructor(registry: RelationshipRegistry)
```

Initializes parser with a relationship registry instance.

## Methods

### parseEmbedExpression

```typescript
parseEmbedExpression(sourceTable: string, expression: string): EmbedRequest | null
```

Parses embedding expressions like `"posts(id,title,comments(id,content))"`.

#### Parameters
- `sourceTable`: Source collection name
- `expression`: Embedding expression string

#### Returns
- `EmbedRequest` object or `null` if invalid

#### Expression Syntax
```
tableName!joinHint(field1,field2,...)
```
- `tableName`: Related table name
- `joinHint`: Optional join type (left/inner/right)
- `fields`: Comma-separated field list

#### Examples
```typescript
// Basic embedding
"posts(id,title)"

// With join hint
"posts!inner(id,title)"

// Nested embedding
"posts(id,title,comments(id,content))"
```

### generateLookupStages

```typescript
generateLookupStages(sourceTable: string, embedRequest: EmbedRequest): any[]
```

Generates MongoDB aggregation pipeline stages for embedding.

#### Parameters
- `sourceTable`: Source collection name
- `embedRequest`: Parsed embed request object

#### Returns
Array of MongoDB aggregation stages including:
- `$lookup` stage for joining
- `$unwind` stage for many-to-one relationships
- `$addFields` stage for result formatting

## Usage Example

```typescript
const parser = new JoinParser(relationshipRegistry);

// Parse embedding expression
const embedRequest = parser.parseEmbedExpression(
  "users",
  "posts!inner(id,title)"
);

// Generate lookup stages
const stages = parser.generateLookupStages("users", embedRequest);
```