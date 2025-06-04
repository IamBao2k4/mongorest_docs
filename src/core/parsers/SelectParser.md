# Select Parser Documentation

The `SelectParser` class handles parsing SELECT clauses for MongoDB projections.

## Overview

The `SelectParser` is responsible for converting string-based field selections into MongoDB projection objects. It supports various selection formats including basic field selection, aliasing, and JSON path selections.

## Usage

```typescript
const parser = new SelectParser();
const projection = parser.parseSelect("fieldA,fieldB");
```

## Select Clause Formats

### Basic Selection
Simple comma-separated field names:
```typescript
"firstName,age,email" → { firstName: 1, age: 1, email: 1 }
```

### All Fields Selection
Using asterisk or empty string:
```typescript
"*" → {}  // Returns all fields
"" → {}   // Returns all fields
```

### Field Aliasing
Using colon to separate alias and field name:
```typescript
"displayName:first_name" → { first_name: 1 }
```

### JSON Path Support
Support for JSON path notation:
```typescript
"data->field" → { data: 1 }
```

## Method Reference

### parseSelect(selectClause: string): Record<string, 1 | 0>

Parameters:
- `selectClause`: A string containing the field selections, comma-separated

Returns:
- A MongoDB projection object where each selected field is mapped to 1

Special cases:
- Returns empty object `{}` when selectClause is empty or "*"
- Handles field aliases using colon notation
- Strips JSON path operators from field names
