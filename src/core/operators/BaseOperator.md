# Operators Documentation

## BaseOperator

BaseOperator is an abstract class that serves as the foundation for all query operators in the system. It provides common functionality for parsing and converting query values.

### Class Structure

```typescript
abstract class BaseOperator {
    abstract readonly name: string;
    abstract convert(field: string, value: any): Record<string, any>;
}
```

### Properties

- `name` (abstract): A string identifier for the operator.

### Methods

#### `convert(field: string, value: any): Record<string, any>`
Abstract method that must be implemented by child classes. It converts the input field and value into a MongoDB query object.

#### `protected parseValue(value: string): any`
Utility method for parsing string values into appropriate data types:
- Converts "null" to `null`
- Converts "true"/"false" to boolean values
- Converts numeric strings to numbers
- Leaves other strings as-is

Example:
```typescript
parseValue("null")     // returns null
parseValue("true")     // returns true
parseValue("123")      // returns 123
parseValue("hello")    // returns "hello"
```

#### `protected parseArray(value: string): any[]`
Parses string representations of arrays in PostgreSQL-style format.

Supports two formats:
- Parentheses format: `(1,2,3)`
- Curly braces format: `{1,2,3}`

Example:
```typescript
parseArray("(1,2,3)")   // returns [1, 2, 3]
parseArray("{1,2,3}")   // returns [1, 2, 3]
```

### Usage

This class is meant to be extended by specific operator implementations. Example:

```typescript
class EqualsOperator extends BaseOperator {
    readonly name = "eq";
    
    convert(field: string, value: any): Record<string, any> {
        return { [field]: this.parseValue(value) };
    }
}
```
