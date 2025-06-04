# Text Operators

## Overview
Text operators provide pattern matching and regular expression functionality for MongoDB queries. These operators support both case-sensitive and case-insensitive searches using wildcards and regex patterns.

## Available Operators

### Like Operator (`like`)
Case-sensitive pattern matching using wildcard characters.

```typescript
// Basic pattern matching
name.like.John*        // Matches: "John", "Johnny", "Johnson", etc.
email.like.*@gmail.com // Matches: "user@gmail.com", "test@gmail.com", etc.
```

### ILike Operator (`ilike`)
Case-insensitive pattern matching using wildcard characters.

```typescript
// Case-insensitive matching
title.ilike.*book*    // Matches: "Handbook", "BOOKS", "notebook", etc.
code.ilike.ABC*       // Matches: "ABC123", "abc", "ABCDEF", etc.
```

### Match Operator (`match`)
Case-sensitive regular expression matching.

```typescript
// Regular expression matching
description.match.^urgent    // Matches strings starting with "urgent"
tag.match.[A-Z]{3}          // Matches exactly 3 uppercase letters
```

### IMatch Operator (`imatch`)
Case-insensitive regular expression matching.

```typescript
// Case-insensitive regex matching
name.imatch.^(john|jane)    // Matches: "John", "JANE", "jane", etc.
status.imatch.(active|pending) // Matches any case of "active" or "pending"
```

## Wildcard Pattern Syntax

For `like` and `ilike` operators:
- `*` - Matches any sequence of characters
- Special characters are automatically escaped

Examples:
```typescript
// Pattern matching examples
title.like.The*        // Matches titles starting with "The"
name.like.*son         // Matches names ending with "son"
code.like.ABC*123      // Matches codes starting with "ABC" and ending with "123"
```

## Regular Expression Support

For `match` and `imatch` operators:
- Full MongoDB regex syntax supported
- No automatic escaping of special characters
- Case sensitivity controlled by operator choice

## MongoDB Equivalents

| REST Operator | MongoDB Equivalent |
|---------------|-------------------|
| like          | { $regex: pattern } |
| ilike         | { $regex: pattern, $options: 'i' } |
| match         | { $regex: pattern } |
| imatch        | { $regex: pattern, $options: 'i' } |

## Integration with Logical Operators

```typescript
// Combined with OR
or=(
  name.like.John*,
  name.like.Jane*
)

// Combined with AND
and=(
  title.ilike.*book*,
  status.match.^(active|pending)
)
```

## Security Notes

- Special characters are automatically escaped for `like`/`ilike` operators
- Regular expressions should be used carefully to avoid performance issues
- Consider using indexes for frequently searched text fields