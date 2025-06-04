# Null Operators

## Overview
Operators for handling null values, boolean checks, and distinct value comparisons in MongoDB queries.

## Is Operator (`is`)

Handles null checks and boolean value comparisons.

### Syntax
```
field.is.value
```

### Supported Values
- `null` - Matches null values
- `not_null` - Matches non-null values
- `true` - Matches boolean true
- `false` - Matches boolean false

### Examples
```typescript
// Null checks
email.is.null        // { email: null }
email.is.not_null    // { email: { $ne: null } }

// Boolean checks
active.is.true       // { active: true }
deleted.is.false     // { deleted: false }
```

## Is Distinct Operator (`isdistinct`)

Checks if a field's value is distinct from (not equal to) a specified value.

### Syntax
```
field.isdistinct.value
```

### Examples
```typescript
// Check for distinct values
status.isdistinct.pending    // { status: { $ne: "pending" } }
category.isdistinct.default  // { category: { $ne: "default" } }
```

## Integration with Logical Operators

Null operators can be combined with logical operators:

```typescript
// Combine with AND
and=(
  email.is.not_null,
  status.isdistinct.deleted
)

// Combine with OR
or=(
  active.is.true,
  status.isdistinct.archived
)
```

## MongoDB Equivalents

| REST Operator | MongoDB Equivalent |
|---------------|-------------------|
| is.null       | { field: null }  |
| is.not_null   | { field: { $ne: null } } |
| is.true       | { field: true }  |
| is.false      | { field: false } |
| isdistinct    | { field: { $ne: value } } |