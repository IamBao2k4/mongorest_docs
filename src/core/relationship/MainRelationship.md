# Relationship Class Documentation

## Overview

The `Relationship` class is an abstract base class that represents relationships between MongoDB collections. It provides core functionality for generating join conditions and lookup stages for MongoDB aggregation pipelines.

## Usage

```typescript
const relationship = new CustomRelationship({
  name: "authorBooks",
  targetTable: "books",
  localField: "authorId",
  foreignField: "_id",
  type: "one-to-many"
});
```

## Class Structure

```typescript
abstract class Relationship {
  protected definition: RelationshipDefinition;
  
  abstract generateJoinCondition(): JoinCondition;
  abstract generateLookupStage(embedRequest: EmbedRequest): any;
  abstract isMultiResult(): boolean;
}
```

## Properties

### Protected Members
- `definition`: The relationship configuration object

### Getters
- `name`: Gets the relationship name
- `targetTable`: Gets the target collection name
- `localField`: Gets the local field name
- `foreignField`: Gets the foreign field name  
- `type`: Gets the relationship type

## Methods

### Abstract Methods

#### `generateJoinCondition(): JoinCondition`
Must be implemented to generate MongoDB join conditions.

#### `generateLookupStage(embedRequest: EmbedRequest): any`
Must be implemented to create MongoDB $lookup stage.

#### `isMultiResult(): boolean`
Must be implemented to indicate if relationship returns multiple results.

### Core Methods

#### `validate(): boolean`
Validates the relationship definition has all required fields:
```typescript
validate(): boolean
// Returns true if all required fields are present
```

#### `protected getJoinType(embedRequest: EmbedRequest): "inner" | "left" | "right"`
Determines join type from embed request:
```typescript
getJoinType(embedRequest) // Returns "inner", "left", or "right"
```

#### `protected generateBasePipeline(embedRequest: EmbedRequest): any[]`
Generates MongoDB aggregation pipeline stages including:
- Filtering (`$match`)
- Sorting (`$sort`) 
- Pagination (`$skip`, `$limit`)
- Field projection (`$project`)

## Example Implementation

```typescript
class OneToManyRelationship extends Relationship {
  generateJoinCondition() {
    return {
      localField: this.localField,
      foreignField: this.foreignField
    };
  }

  generateLookupStage(embedRequest) {
    return {
      $lookup: {
        from: this.targetTable,
        ...this.generateJoinCondition()
      }
    };
  }

  isMultiResult() {
    return true;
  }
}
```