---
sidebar_position: 4
---

# Custom Validate Syntax

MongoREST cho phép tạo custom validation syntax để phù hợp với business logic cụ thể.

## Defining Custom Syntax

### Basic Custom Validator

```typescript
export class CustomValidator extends ValidatorPlugin {
    constructor() {
        super({
            name: 'customValidator',
            version: '1.0.0',
            description: 'Custom validation logic'
        });
    }

    public validate(data: any, context?: any): boolean {
        // Your custom validation logic
        return true;
    }
}
```

## Usage Examples

### 1. Password Strength Validator

```typescript
const passwordValidator = new CompositeValidator([
    'required',
    'minLength8',
    'hasUppercase',
    'hasLowercase',
    'hasNumber',
    'hasSpecialChar'
]);

loader.loadCustomPlugin('strongPassword', passwordValidator);
```

### 2. Business Logic Validator

```typescript
const businessValidator = new BusinessRuleValidator();
businessValidator.registerRule('minimumOrderAmount', (data, context) => {
    const orderTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return orderTotal >= 10; // Minimum $10 order
});

loader.loadCustomPlugin('businessRules', businessValidator);
```