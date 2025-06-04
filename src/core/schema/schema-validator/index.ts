import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Schema, FieldDefinition, ValidationError, ValidationResult, Relationship } from '../types';

/**
 * Schema Validator - Validates JSON Schema Definitions using AJV
 */
export class SchemaValidator {
  private static ajv: Ajv;
  private static schemaValidator: ValidateFunction<any>;
  
  static {
    // Initialize AJV instance
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false,
      removeAdditional: false
    });
    
    // Add format support
    addFormats(this.ajv);
    
    // Define the main schema validation schema
    this.schemaValidator = this.ajv.compile(this.getSchemaDefinitionSchema());
  }
  
  /**
   * Validate complete schema definition using AJV
   */
  static validateSchemaDefinition(schema: any): ValidationResult {
    // First validate with AJV
    const isValid = this.schemaValidator(schema);
    const errors: ValidationError[] = [];
    
    if (!isValid && this.schemaValidator.errors) {
      // Convert AJV errors to our error format
      for (const error of this.schemaValidator.errors) {
        errors.push({
          name: "SchemaValidationError",
          field: error.instancePath?.replace('/', '') || error.keyword,
          error: error.keyword?.toUpperCase() || 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
          severity: 'error'
        });
      }
    }
    
    // Additional custom validations only if basic AJV validation passed
    if (errors.length === 0) {
      if (schema.fields) {
        const customErrors = this.performCustomValidations(schema);
        errors.push(...customErrors);
      }
      
      if (schema.relationships) {
        const relationshipErrors = this.validateRelationshipDefinitions(schema.relationships, new Map());
        errors.push(...relationshipErrors);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Validate field definition using AJV
   */
  static validateFieldDefinition(fieldName: string, fieldDef: any): ValidationError[] {
    const fieldSchema = this.getFieldDefinitionSchema();
    const validator = this.ajv.compile(fieldSchema);
    
    const isValid = validator(fieldDef);
    const errors: ValidationError[] = [];
    
    if (!isValid && validator.errors) {
      for (const error of validator.errors) {
        errors.push({
          name: "FieldValidationError",
          field: fieldName,
          error: error.keyword?.toUpperCase() || 'FIELD_VALIDATION_ERROR',
          message: `Field '${fieldName}': ${error.message}`,
          severity: 'error'
        });
      }
    }
    
    // Type-specific validation
    const typeErrors = this.validateFieldTypeSpecific(fieldName, fieldDef);
    errors.push(...typeErrors);
    
    return errors;
  }
  
  /**
   * Create AJV validator for custom field type
   */
  static createFieldTypeValidator(fieldDef: FieldDefinition): ValidateFunction<any> {
    const schema = this.fieldDefinitionToAjvSchema(fieldDef);
    return this.ajv.compile(schema);
  }
  
  /**
   * Validate data against field definition using AJV
   */
  static validateDataWithAjv(data: any, fieldDef: FieldDefinition, fieldName: string): ValidationResult {
    const validator = this.createFieldTypeValidator(fieldDef);
    const isValid = validator(data);
    
    const errors: ValidationError[] = [];
    if (!isValid && validator.errors) {
      for (const error of validator.errors) {
        errors.push({
          name: "DataValidationError",
          field: fieldName,
          error: error.keyword?.toUpperCase() || 'DATA_VALIDATION_ERROR',
          message: error.message || 'Data validation failed',
          severity: 'error',
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Generate JSON Schema from field definition
   */
  static generateJsonSchema(schema: Schema): any {
    const jsonSchema: any = {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false
    };
    
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      jsonSchema.properties[fieldName] = this.fieldDefinitionToAjvSchema(fieldDef);
      if (fieldDef.required) {
        jsonSchema.required.push(fieldName);
      }
    }
    
    return jsonSchema;
  }
  
  /**
   * Detect circular dependencies between schemas
   */
  static detectCircularDependencies(schemas: Map<string, Schema>): ValidationError[] {
    const dependencies = new Map<string, string[]>();
    const errors: ValidationError[] = [];
    
    // Build dependency graph
    for (const [collectionName, schema] of schemas) {
      dependencies.set(collectionName, []);
      
      if (schema.relationships) {
        for (const [relName, relDef] of Object.entries(schema.relationships)) {
          if (relDef.collection) {
            dependencies.get(collectionName)!.push(relDef.collection);
          }
        }
      }
    }
    
    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (collection: string, path: string[] = []): boolean => {
      if (recursionStack.has(collection)) {
        errors.push({
          name: "CircularDependencyError",
          error: 'CIRCULAR_DEPENDENCY',
          message: `Circular dependency detected: ${[...path, collection].join(' -> ')}`,
          severity: 'error'
        });
        return true;
      }
      
      if (visited.has(collection)) {
        return false;
      }
      
      visited.add(collection);
      recursionStack.add(collection);
      
      const deps = dependencies.get(collection) || [];
      for (const dep of deps) {
        if (hasCycle(dep, [...path, collection])) {
          return true;
        }
      }
      
      recursionStack.delete(collection);
      return false;
    };
    
    for (const collection of dependencies.keys()) {
      if (!visited.has(collection)) {
        hasCycle(collection);
      }
    }
    
    return errors;
  }
  
  /**
   * Generate validation report with errors and suggestions
   */
  static generateValidationReport(schema: any, errors: ValidationError[]): any {
    const report = {
      valid: errors.length === 0,
      schema: schema.collection,
      errorCount: errors.length,
      errors: [] as ValidationError[],
      warnings: [] as ValidationError[],
      suggestions: [] as string[]
    };
    
    // Categorize errors by severity
    for (const error of errors) {
      if (error.severity === 'warning') {
        report.warnings.push(error);
      } else {
        report.errors.push(error);
      }
    }
    
    // Generate helpful suggestions
    report.suggestions = this.generateValidationSuggestions(schema, errors);
    
    return report;
  }
  
  /**
   * Private helper methods
   */
  private static getSchemaDefinitionSchema(): any {
    return {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$'
        },
        fields: {
          type: 'object',
          patternProperties: {
            '^[a-zA-Z_][a-zA-Z0-9_]*$': {
              $ref: '#/$defs/fieldDefinition'
            }
          },
          additionalProperties: true,
          minProperties: 1
        },
        relationships: {
          type: ['object', 'null'],
          patternProperties: {
            '^[a-zA-Z_][a-zA-Z0-9_]*$': {
              $ref: '#/$defs/relationshipDefinition'
            }
          },
          additionalProperties: true
        },
        indexes: {
          type: ['array', 'null'],
          items: {
            $ref: '#/$defs/indexDefinition'
          }
        },
        access: {
          type: ['object', 'null']
        },
        timestamps: {
          type: ['boolean', 'null']
        },
        softDelete: {
          type: ['boolean', 'null']
        }
      },
      required: ['collection'],
      additionalProperties: true,
      $defs: {
        fieldDefinition: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['string', 'number', 'boolean', 'date', 'objectId', 'array', 'object', 'mixed', 'buffer', 'decimal']
            },
            required: { type: ['boolean', 'null'] },
            default: { type: ['string', 'number', 'boolean', 'object', 'array', 'null'] },
            unique: { type: ['boolean', 'null'] },
            index: { type: ['boolean', 'null'] },
            minLength: { type: ['integer', 'null'], minimum: 0 },
            maxLength: { type: ['integer', 'null'], minimum: 1 },
            pattern: { type: ['string', 'null'] },
            enum: { type: ['array', 'null'], items: { type: 'string' } },
            format: { type: ['string', 'null'], enum: ['email', 'url', 'uuid', 'phone'] },
            min: { type: ['number', 'null'] },
            max: { type: ['number', 'null'] },
            integer: { type: ['boolean', 'null'] },
            positive: { type: ['boolean', 'null'] },
            minItems: { type: ['integer', 'null'], minimum: 0 },
            maxItems: { type: ['integer', 'null'], minimum: 1 },
            uniqueItems: { type: ['boolean', 'null'] },
            items: { 
              oneOf: [
                { $ref: '#/$defs/fieldDefinition' },
                { type: 'null' }
              ]
            },
            properties: { 
              type: ['object', 'null'],
              patternProperties: {
                '^[a-zA-Z_][a-zA-Z0-9_]*$': {
                  $ref: '#/$defs/fieldDefinition'
                }
              },
              additionalProperties: true
            },
            description: { type: ['string', 'null'] },
            example: { type: ['string', 'number', 'boolean', 'object', 'array', 'null'] }
          },
          required: ['type'],
          additionalProperties: true
        },
        relationshipDefinition: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['hasOne', 'hasMany', 'belongsTo', 'manyToMany']
            },
            collection: { type: 'string' },
            foreignField: { type: ['string', 'null'] },
            localField: { type: ['string', 'null'] },
            through: { type: ['string', 'null'] }
          },
          required: ['type', 'collection'],
          additionalProperties: true
        },
        indexDefinition: {
          type: 'object',
          properties: {
            name: { type: ['string', 'null'] },
            fields: {
              type: 'object',
              patternProperties: {
                '^[a-zA-Z_][a-zA-Z0-9_.]*$': {
                  oneOf: [
                    { type: 'integer', enum: [1, -1] },
                    { type: 'string', enum: ['text', '2dsphere'] }
                  ]
                }
              },
              additionalProperties: true
            },
            options: {
              type: ['object', 'null'],
              properties: {
                unique: { type: ['boolean', 'null'] },
                sparse: { type: ['boolean', 'null'] },
                background: { type: ['boolean', 'null'] },
                expireAfterSeconds: { type: ['integer', 'null'], minimum: 0 }
              },
              additionalProperties: true
            }
          },
          required: ['fields'],
          additionalProperties: true
        }
      }
    };
  }
  
  private static getFieldDefinitionSchema(): JSONSchemaType<FieldDefinition> {
    return this.getSchemaDefinitionSchema().$defs!.fieldDefinition;
  }
  
  private static fieldDefinitionToAjvSchema(fieldDef: FieldDefinition): any {
    const schema: any = {};
    
    switch (fieldDef.type) {
      case 'string':
        schema.type = 'string';
        if (fieldDef.minLength !== undefined) schema.minLength = fieldDef.minLength;
        if (fieldDef.maxLength !== undefined) schema.maxLength = fieldDef.maxLength;
        if (fieldDef.pattern) schema.pattern = fieldDef.pattern;
        if (fieldDef.enum) schema.enum = fieldDef.enum;
        if (fieldDef.format) schema.format = fieldDef.format;
        break;
        
      case 'number':
        schema.type = 'number';
        if (fieldDef.min !== undefined) schema.minimum = fieldDef.min;
        if (fieldDef.max !== undefined) schema.maximum = fieldDef.max;
        if (fieldDef.integer) schema.type = 'integer';
        break;
        
      case 'boolean':
        schema.type = 'boolean';
        break;
        
      case 'date':
        schema.type = 'string';
        schema.format = 'date-time';
        break;
        
      case 'objectId':
        schema.type = 'string';
        schema.pattern = '^[0-9a-fA-F]{24}$';
        break;
        
      case 'array':
        schema.type = 'array';
        if (fieldDef.minItems !== undefined) schema.minItems = fieldDef.minItems;
        if (fieldDef.maxItems !== undefined) schema.maxItems = fieldDef.maxItems;
        if (fieldDef.uniqueItems) schema.uniqueItems = fieldDef.uniqueItems;
        if (fieldDef.items) schema.items = this.fieldDefinitionToAjvSchema(fieldDef.items);
        break;
        
      case 'object':
        schema.type = 'object';
        if (fieldDef.properties) {
          schema.properties = {};
          for (const [propName, propDef] of Object.entries(fieldDef.properties)) {
            schema.properties[propName] = this.fieldDefinitionToAjvSchema(propDef);
          }
        }
        break;
        
      default:
        schema.type = 'string';
    }
    
    if (fieldDef.description) {
      schema.description = fieldDef.description;
    }
    
    return schema;
  }
  
  private static performCustomValidations(schema: Schema ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validate field definitions with custom logic
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      // Check min/max length consistency for strings
      if (fieldDef.type === 'string' && fieldDef.minLength && fieldDef.maxLength) {
        if (fieldDef.minLength > fieldDef.maxLength) {
          errors.push({
            name: "InvalidLengthRangeError",
            field: fieldName,
            error: 'INVALID_LENGTH_RANGE',
            message: `Field '${fieldName}': maxLength must be greater than or equal to minLength`,
            severity: 'error'
          });
        }
      }
      
      // Check min/max value consistency for numbers
      if (fieldDef.type === 'number' && fieldDef.min !== undefined && fieldDef.max !== undefined) {
        if (fieldDef.min > fieldDef.max) {
          errors.push({
            name: "InvalidRangeError",
            field: fieldName,
            error: 'INVALID_RANGE',
            message: `Field '${fieldName}': min must be less than or equal to max`,
            severity: 'error'
          });
        }
      }
      
      // Check array items consistency
      if (fieldDef.type === 'array' && fieldDef.minItems && fieldDef.maxItems) {
        if (fieldDef.minItems > fieldDef.maxItems) {
          errors.push({
            name: "InvalidItemsRangeError",
            field: fieldName,
            error: 'INVALID_ITEMS_RANGE',
            message: `Field '${fieldName}': minItems must be less than or equal to maxItems`,
            severity: 'error'
          });
        }
      }
    }
    
    return errors;
  }
  
  private static validateFieldTypeSpecific(fieldName: string, fieldDef: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Array fields must have items definition
    if (fieldDef.type === 'array' && !fieldDef.items) {
      errors.push({
        name: "MissingArrayItemsError",
        field: fieldName,
        error: 'MISSING_ARRAY_ITEMS',
        message: `Array field '${fieldName}' must have items definition`,
        severity: 'error'
      });
    }
    
    // Validate regex patterns
    if (fieldDef.pattern) {
      try {
        new RegExp(fieldDef.pattern);
      } catch (e) {
        errors.push({
          name: "InvalidPatternError",
          field: fieldName,
          error: 'INVALID_PATTERN',
          message: `Field '${fieldName}' has invalid regex pattern: ${fieldDef.pattern}`,
          severity: 'error'
        });
      }
    }
    
    return errors;
  }
  
  private static validateRelationshipDefinitions(
    relationships: Record<string, any>, 
    allSchemas: Map<string, Schema>
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const [relName, relDef] of Object.entries(relationships)) {
      // Note: foreignField is optional for some relationship types
      // belongsTo typically stores the foreign key in the current collection
      // hasMany/hasOne typically store the foreign key in the related collection
      // manyToMany uses a junction table
      
      // Only require foreignField for belongsTo and hasMany if not specified
      if (relDef.type === 'belongsTo' && !relDef.foreignField) {
        // For belongsTo, we can auto-generate foreignField as ${collection}Id
        // So this is just a warning, not an error
        errors.push({
          name: "MissingForeignKeyError",
          field: relName,
          error: 'MISSING_FOREIGN_KEY',
          message: `belongsTo relationship '${relName}' should specify foreignField (will default to '${relDef.collection}Id')`,
          severity: 'warning'
        });
      }
      
      // Validate junction table for many-to-many
      if (relDef.type === 'manyToMany' && !relDef.through) {
        errors.push({
          name: "MissingJunctionTableError",
          field: relName,
          error: 'MISSING_JUNCTION_TABLE',
          message: `manyToMany relationship '${relName}' must specify through table`,
          severity: 'error'
        });
      }
      
      // Validate referenced collection exists (if schemas provided)
      if (allSchemas.size > 0 && !allSchemas.has(relDef.collection)) {
        errors.push({
          name: "InvalidCollectionReferenceError",
          field: relName,
          error: 'INVALID_COLLECTION_REFERENCE',
          message: `Referenced collection '${relDef.collection}' does not exist`,
          severity: 'error'
        });
      }
    }
    
    return errors;
  }
  
  private static generateValidationSuggestions(schema: any, errors: ValidationError[]): string[] {
    const suggestions: string[] = [];
    const errorTypes = errors.map(e => e.error);
    
    if (errorTypes.includes('MISSING_REQUIRED_PROPERTY')) {
      suggestions.push('Ensure schema has required properties: collection');
    }
    
    if (errorTypes.includes('INVALID_FIELD_TYPE')) {
      suggestions.push('Use supported field types: string, number, boolean, date, objectId, array, object, mixed, buffer, decimal');
    }
    
    if (errorTypes.includes('INVALID_LENGTH_RANGE')) {
      suggestions.push('Ensure maxLength is greater than or equal to minLength for string fields');
    }
    
    if (errorTypes.includes('MISSING_ARRAY_ITEMS')) {
      suggestions.push('Array fields must specify the type of their items');
    }
    
    if (errorTypes.includes('CIRCULAR_DEPENDENCY')) {
      suggestions.push('Review relationship definitions to eliminate circular dependencies');
    }
    
    if (errorTypes.includes('INVALID_PATTERN')) {
      suggestions.push('Check regex patterns for syntax errors');
    }
    
    if (errorTypes.includes('MISSING_FOREIGN_KEY')) {
      suggestions.push('Consider specifying foreignField for relationship definitions for clarity');
    }
    
    if (!schema.fields || Object.keys(schema.fields).length === 0) {
      suggestions.push('Add field definitions to describe the data structure');
    }
    
    return suggestions;
  }
}
