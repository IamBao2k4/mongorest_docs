# Order Parser

The Order Parser handles parsing of sort/order parameters for MongoDB queries. It converts string-based order clauses into MongoDB sort specifications.

## Usage

The `OrderParser` class provides a simple way to parse order/sort parameters:

```typescript
const parser = new OrderParser();
const sortSpec = parser.parseOrder("age.desc,height.asc");
// Result: { age: -1, height: 1 }
```

## Input Format

The order clause accepts a comma-separated list of field specifications. Each field specification follows this format:

- `fieldName.direction`
- `fieldName` (defaults to ascending)

Where:
- `fieldName`: The field to sort by
- `direction`: Optional sort direction - either `asc` or `desc`

Examples:
```
age.desc           // Sort by age descending
name.asc           // Sort by name ascending
height             // Sort by height ascending (default)
age.desc,name.asc  // Sort by age descending, then name ascending
```

## Output

The parser returns a MongoDB sort specification object where:
- Fields are keys
- Values are:
  - `1` for ascending order
  - `-1` for descending order

Example output:
```typescript
// Input: "age.desc,name.asc" 
{
  age: -1,
  name: 1
}
```

## Limitations

- MongoDB does not directly support NULLS FIRST/LAST directives
- Nested field sorting is not currently supported
- All sort directions default to ascending if not specified