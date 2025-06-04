# MongoDB REST Query Operators

## Array Operators

Array operators provide functionality for querying array fields in MongoDB documents.

### Available Operators

#### In Operator (`in`)
Matches any values that exist in the specified array.

```typescript
// Usage: field.in.(value1,value2,...)
tags.in.(red,blue,green)  
// MongoDB: { tags: { $in: ['red', 'blue', 'green'] } }
```

#### Contains Operator (`cs`)
Matches arrays that contain all specified values.

```typescript
// Usage: field.cs.(value1,value2,...)
categories.cs.(electronics,gaming)
// MongoDB: { categories: { $all: ['electronics', 'gaming'] } }
```

#### Contained In Operator (`cd`)
Matches arrays that are completely contained within the specified values.

```typescript
// Usage: field.cd.(value1,value2,...)
permissions.cd.(read,write,delete)
// MongoDB: { permissions: { $in: ['read', 'write', 'delete'] } }
```

#### Overlap Operator (`ov`)
Matches arrays that have at least one element in common with the specified values.

```typescript
// Usage: field.ov.(value1,value2,...)
interests.ov.(sports,music)
// MongoDB: { interests: { $elemMatch: { $in: ['sports', 'music'] } } }
```

### Value Format

Array values should be provided in a parentheses-enclosed, comma-separated list:

```
(value1,value2,value3)
```

### Examples

```typescript
// Find documents where tags include either 'urgent' or 'important'
tags.in.(urgent,important)

// Find documents where all specified categories are present
categories.cs.(books,fiction)

// Find documents where permissions are a subset of allowed values
permissions.cd.(read,write,admin)

// Find documents where interests overlap with given values
interests.ov.(sports,music,art)
```

### Type Conversion

- String values are preserved as strings
- Numeric values are converted to numbers
- Boolean values (`true`, `false`) are converted to booleans
- `null` is preserved as null

### Integration with Logical Operators

Array operators can be combined with logical operators:

```typescript
// Match documents with either tag condition
or=(tags.in.(urgent),tags.cs.(important,critical))

// Match documents meeting both conditions
and=(categories.cs.(books),permissions.cd.(read,write))
```