interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  min?: number;
  max?: number;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

function validateField(value: any, rule: ValidationRule, fieldName: string): string[] {
  const errors: string[] = [];

  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  if (value === undefined || value === null) {
    return errors;
  }

  if (rule.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      errors.push(`${fieldName} must be of type ${rule.type}`);
    }
  }

  if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
    errors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
  }

  if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
    errors.push(`${fieldName} must be no more than ${rule.maxLength} characters long`);
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    errors.push(`${fieldName} does not match required pattern`);
  }

  if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
    errors.push(`${fieldName} must be at least ${rule.min}`);
  }

  if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
    errors.push(`${fieldName} must be at most ${rule.max}`);
  }

  return errors;
}

export function validate(data: any, schema: ValidationSchema): { isValid: boolean; errors: string[]; data: any } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, errors: ['Data must be an object'], data };
  }

  const errors: string[] = [];

  for (const [fieldName, rule] of Object.entries(schema)) {
    const fieldErrors = validateField(data[fieldName], rule, fieldName);
    errors.push(...fieldErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data
  };
}

export function validateAndThrow(data: any, schema: ValidationSchema): any {
  const result = validate(data, schema);
  
  if (!result.isValid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`);
  }
  
  return result.data;
}

// Example usage
const userSchema: ValidationSchema = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  age: { type: 'number', min: 0, max: 150 }
};

console.log(validate({ name: "John", email: "john@example.com", age: 30 }, userSchema));
// { isValid: true, errors: [], data: { name: "John", email: "john@example.com", age: 30 } }

console.log(validate({ name: "J", email: "invalid-email" }, userSchema));
// { isValid: false, errors: ["name must be at least 2 characters long", "email does not match required pattern"], data: { name: "J", email: "invalid-email" } }