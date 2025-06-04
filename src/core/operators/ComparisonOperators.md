# Comparison Operators

## Overview

Comparison operators provide functionality for comparing values in MongoDB queries. These operators are part of the query parser system and handle various comparison operations.

## Available Operators

### Equal Operator (`eq`)
Matches values that are equal to the specified value.

```typescript
name.eq.John      // { name: "John" }
age.eq.25         // { age: 25 }
```

### Not Equal Operator (`neq`)
Matches values that are not equal to the specified value.

```typescript
status.neq.pending    // { status: { $ne: "pending" } }
count.neq.0          // { count: { $ne: 0 } }
```

### Greater Than Operator (`gt`)
Matches values that are greater than the specified value.

```typescript
age.gt.18        // { age: { $gt: 18 } }
price.gt.100     // { price: { $gt: 100 } }
```

### Greater Than or Equal Operator (`gte`)
Matches values that are greater than or equal to the specified value.

```typescript
score.gte.90     // { score: { $gte: 90 } }
date.gte.2024-01-01  // { date: { $gte: "2024-01-01" } }
```

### Less Than Operator (`lt`)
Matches values that are less than the specified value.

```typescript
age.lt.21        // { age: { $lt: 21 } }
price.lt.50      // { price: { $lt: 50 } }
```

### Less Than or Equal Operator (`lte`)
Matches values that are less than or equal to the specified value.

```typescript
quantity.lte.100  // { quantity: { $lte: 100 } }
weight.lte.50.5   // { weight: { $lte: 50.5 } }
```

## Value Type Handling

All comparison operators automatically handle type conversion for:
- Numbers
- Strings
- Booleans
- Dates
- Null values

## Usage with Logical Operators

Comparison operators can be combined with logical operators for complex queries:

```typescript
// Match age between 18 and 30
and=(age.gte.18,age.lte.30)

// Match price less than 50 or greater than 100
or=(price.lt.50,price.gt.100)
```

## MongoDB Equivalents

| REST Operator | MongoDB Operator |
|---------------|-----------------|
| eq            | $eq            |
| neq           | $ne            |
| gt            | $gt            |
| gte           | $gte           |
| lt            | $lt            |
| lte           | $lte           |

## Examples

```typescript
// Basic comparisons
age.eq.25
price.gt.100
date.lte.2024-01-01

// With type conversion
active.eq.true
count.neq.null

// Numeric comparisons
score.gte.90
quantity.lt.5
```