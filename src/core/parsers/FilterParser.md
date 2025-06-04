# MongoDB REST Query Parsers

...existing sections for OrderParser and LogicalParser...

## Filter Parser

Handles conversion of PostgREST-style filter expressions into MongoDB query conditions.

### Usage

```typescript
const parser = new FilterParser();
const filter = parser.parseFilter("age", "lt.18");
const query = parser.convertFilter(filter);
// Result: { age: { $lt: 18 } }
```

### Supported Operators

#### Comparison Operators
- `eq` - Equal to
- `neq` - Not equal to
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal

```
age.eq.25         // { age: { $eq: 25 } }
price.gt.100      // { price: { $gt: 100 } }
```

#### Text Operators
- `like` - Pattern matching (case-sensitive)
- `ilike` - Pattern matching (case-insensitive)
- `match` - Regular expression match
- `imatch` - Case-insensitive regular expression

```
name.like.John%   // { name: /^John.*/ }
email.ilike.%gmail.com  // { email: /.*gmail\.com$/i }
```

#### Array Operators
- `in` - Value in array
- `contains` - Array contains value
- `contained` - Array is contained in
- `overlap` - Arrays have common elements

```
status.in.(active,pending)   // { status: { $in: ['active', 'pending'] } }
tags.contains.urgent        // { tags: 'urgent' }
```

#### Null Operators
- `is` - Is null/not null
- `isdistinct` - Is distinct/not distinct

```
email.is.null     // { email: null }
name.isdistinct   // { name: { $ne: null } }
```

### Modifiers

Supports `any` and `all` modifiers for array operations:

```
tags.like(any).(urgent,important)  // Match any of the tags
status.in(all).(draft,review)      // Match all statuses
```

### Filter Syntax

Basic format: `field.operator.value`

Examples:
```
age.gt.21
name.like.John%
tags.contains.urgent
status.in.(active,pending)
```

### Type Conversion

The parser automatically handles type conversion for:
- Numbers
- Booleans
- Null values
- Arrays
- Regular expressions

### Error Handling

```typescript
// Throws error for unknown operators
parser.convertFilter({ field: "age", operator: "invalid", value: "25" });
// Error: Unknown operator: invalid
```

### Integration with Logical Operations

Filters can be combined with logical operators:

```
and=(age.gt.21,status.eq.active)
or=(category.in.(A,B),price.lt.100)
```