---
sidebar_position: 3
---

# Validate Syntax

MongoREST Plugin System hỗ trợ nhiều cú pháp validation khác nhau để đảm bảo tính toàn vẹn của dữ liệu.

## Date Validation System

### Date Format Patterns

```typescript
export class DateRegexPatterns {
    static readonly ISO_STRING = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    static readonly DATE_STRING = /^\d{4}-\d{2}-\d{2}$/;
    static readonly DATE_TIME_STRING = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?$/;
    static readonly DATE_NOW_PLUS = /^Date\.now\(\)\s*\+\s*(\d+(?:\s*[\*\/\+\-]\s*\d+)*)$/;
    static readonly DATE_NOW_MINUS = /^Date\.now\(\)\s*\-\s*(\d+(?:\s*[\*\/\+\-]\s*\d+)*)$/;
}
```

### Supported Date Formats

| Format | Example | Description |
|--------|---------|-------------|
| ISO String | `2024-01-15T10:30:00.000Z` | Standard ISO 8601 format |
| Date String | `2024-01-15` | Simple date format |
| DateTime String | `2024-01-15T10:30:00` | Date with time |
| Date Expression | `Date.now() + 86400000` | Dynamic date calculation |

### Date Validation Classes

```typescript
export class DateValidate {
    private dateValidates: DateFormatValidateBase[];

    constructor(date: string) {
        this.dateValidates = [
            new DateStringValidate(date),
            new DateTimeStringValidate(date),
            new ISOStringValidate(date),
            new DateNowValidate(date)
        ];
    }

    public isValidDateFormat(): boolean {
        return this.dateValidates.some(validate => validate.isValid());
    }
}
```
## Field Plugin Syntax

### Simple Field Plugin
```json
{
  "createdAt": true,
  "updatedAt": true,
  "uuid": true
}
```
## Validation Flow

### 1. Schema Parsing
```
Schema Definition
    ↓
Extract Validators
    ↓
Create Validator Chain
    ↓
Execute Validation
```

### 2. Validation Execution
```typescript
async function validateField(
    fieldName: string,
    value: any,
    validators: string[]
): Promise<ValidationResult> {
    const errors = [];
    
    for (const validatorName of validators) {
        const isValid = await pluginManager.executePlugin(
            validatorName,
            value,
            { field: fieldName }
        );
        
        if (!isValid) {
            errors.push({
                field: fieldName,
                validator: validatorName,
                message: `Validation failed: ${validatorName}`
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
```
## Best Practices

1. **Chain validators logically**: Put format validators before content validators
2. **Provide clear error messages**: Include field name and validation type
3. **Use appropriate validation levels**: Field-level vs document-level
4. **Cache validation results**: For expensive validations
5. **Handle async validations**: Some validators may need external checks

## Performance Tips

1. **Order validators by cost**: Put cheap validators first
2. **Short-circuit on failure**: Stop validation chain on first failure when appropriate
3. **Batch validations**: Validate multiple fields in parallel
4. **Use compiled patterns**: Pre-compile regex patterns
