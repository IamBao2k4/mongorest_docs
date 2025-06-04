# ManyToManyRelationship Documentation

## Overview

The `ManyToManyRelationship` class implements many-to-many relationships in MongoDB using a junction table. It extends the base `Relationship` class to handle complex relationships between collections through an intermediary collection.

## Class Structure

```typescript
class ManyToManyRelationship extends Relationship {
  private junctionConfig: JunctionConfig;
}
```

## Configuration

### Junction Configuration
```typescript
{
  table: string;      // Junction table name
  localKey: string;   // Field in junction that links to source
  foreignKey: string; // Field in junction that links to target
}
```

### Example Configuration
```typescript
const relationship = new ManyToManyRelationship({
  name: "categories",
  targetTable: "categories",
  localField: "_id",
  foreignField: "_id",
  type: "many-to-many",
  junction: {
    table: "product_categories",
    localKey: "product_id",
    foreignKey: "category_id"
  }
});
```

## Methods

### generateJoinCondition
Returns join configuration for the relationship:
```typescript
generateJoinCondition(): JoinCondition
// Returns: { localField, foreignField, joinType: 'left' }
```

### generateLookupStage
Generates MongoDB aggregation pipeline stages for the many-to-many join:
```typescript
generateLookupStage(embedRequest: EmbedRequest): any[]
```

#### Generated Stages
1. Junction Lookup: Joins source with junction table
2. Target Lookup: Joins junction results with target table
3. Cleanup: Removes temporary junction fields

#### Example Pipeline
```typescript
[
  {
    $lookup: {
      from: "product_categories",
      localField: "_id",
      foreignField: "product_id",
      as: "_junction"
    }
  },
  {
    $lookup: {
      from: "categories",
      localField: "_junction.category_id",
      foreignField: "_id",
      as: "categories"
    }
  },
  {
    $unset: "_junction"
  }
]
```

### isMultiResult
```typescript
isMultiResult(): boolean
// Always returns true for many-to-many relationships
```

## Usage Example

```typescript
// Define relationship
const productCategories = new ManyToManyRelationship({
  name: "categories",
  targetTable: "categories",
  localField: "_id",
  foreignField: "_id",
  type: "many-to-many",
  junction: {
    table: "product_categories",
    localKey: "product_id",
    foreignKey: "category_id"
  }
});

// Generate lookup stages
const stages = productCategories.generateLookupStage({
  table: "categories",
  fields: ["name", "description"]
});
```