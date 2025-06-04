
This documentation covers the query parsing system for MongoDB REST API, including Order and Logical operation parsing.

## Order Parser

Handles conversion of string-based sort parameters into MongoDB sort specifications.

### Usage

```typescript
const parser = new OrderParser();
const sortSpec = parser.parseOrder("age.desc,height.asc");
// Result: { age: -1, height: 1 }
```

### Order Syntax

- Format: `fieldName.direction`
- Multiple fields: Separate by commas
- Directions: `asc` (default) or `desc`

Examples:
```
age.desc           // Sort by age descending
name.asc           // Sort by name ascending
height             // Sort by height ascending (default)
age.desc,name.asc  // Sort by age descending, then name ascending
```

## Logical Parser

Handles logical operations (AND, OR, NOT) for query filtering.

### Usage

```typescript
const parser = new LogicalParser();
const query = parser.parseLogical("or=(age.lt.18,age.gt.21)");
// Result: { $or: [{ age: { $lt: 18 } }, { age: { $gt: 21 } }] }
```

### Logical Operations

#### OR Operation
```
or=(condition1,condition2)
```
Example:
```
or=(age.lt.18,age.gt.21)
```

#### AND Operation
```
and=(condition1,condition2)
```
Example:
```
and=(status.eq.active,age.gt.18)
```

#### NOT Operation
```
not.condition
not.and=(condition1,condition2)
not.or=(condition1,condition2)
```
Examples:
```
not.age.eq.25
not.and=(status.eq.active,age.lt.18)
```

### Nested Conditions

The parser supports nested logical operations:

```
or=(age.lt.18,and=(status.eq.active,score.gt.90))
```

## MongoDB Output

### Sort Specifications
- Ascending: `1`
- Descending: `-1`

### Logical Operators
- OR: `$or`
- AND: `$and`
- NOT: `$not`

## Limitations

### Order Parser
- No support for NULLS FIRST/LAST directives
- No nested field sorting
- Default ascending sort

### Logical Parser
- Complex nested expressions should be properly parenthesized
- Field names cannot contain dots
- Values are automatically type-converted (strings, numbers, booleans)