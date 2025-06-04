# Logical Operators

## Not Operator

The Not operator provides logical negation functionality for MongoDB queries. It inverts the result of another operator.

### Usage

The Not operator (`not`) requires an inner operator to negate its results.

```typescript
// Basic usage
status.not.eq.active    // { status: { $not: { $eq: "active" } } }

// With comparison operators
age.not.gt.18          // { age: { $not: { $gt: 18 } } }

// With pattern matching
name.not.like.John%    // { name: { $not: /^John.*/ } }
```

### Syntax

```
field.not.operator.value
```

Where:
- `field`: The field to query
- `not`: The negation operator
- `operator`: The inner operator to negate
- `value`: The value to compare against

### MongoDB Equivalent

The operator translates to MongoDB's `$not` operator:

```javascript
{ field: { $not: innerQuery } }
```

### Examples

```typescript
// Negate equality
email.not.eq.test@example.com

// Negate pattern matching
description.not.like.%test%

// Negate comparison
price.not.lt.100

// Negate array containment
tags.not.in.(draft,review)
```

### Error Handling

The Not operator requires an inner operator. Using it without one will throw an error:

```typescript
// This will throw an error
status.not.active  // Error: Not operator requires an inner operator
```

### Integration with Other Operators

The Not operator can be combined with other logical operators:

```typescript
// Complex logical expressions
or=(
  status.not.eq.active,
  age.not.lt.18
)

and=(
  category.not.in.(draft,deleted),
  date.not.lt.2024-01-01
)
```