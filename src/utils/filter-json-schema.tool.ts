import Ajv from "ajv";
import addFormats from "ajv-formats";
import { isMongoId } from "class-validator";
import { HttpError } from "./http-error";
import { appSettings } from "../configs/app-settings";

// Create AJV instance with custom keywords
function createAjvInstance(): Ajv {
    const ajv = new Ajv({
        allErrors: true,
        useDefaults: true,
        coerceTypes: false,
        removeAdditional: true,
        strict: false
    });
    
    addFormats(ajv);
    setupCustomKeywords(ajv);
    return ajv;
}

// Setup all custom keywords for AJV
function setupCustomKeywords(ajv: Ajv): void {
    // Widget validation keyword
    ajv.addKeyword({
        keyword: "widgetValidation",
        type: ["string", "number", "boolean", "array", "object", "null"],
        schemaType: "object",
        modifying: true,
        compile: (schema) => {
            return function validate(data: any, dataCxt: any) {
                const { widget, choices, isMultiple, typeSelect, typeRelation, default: defaultValue } = schema;
                
                switch (widget) {
                    case 'select':
                        return validateSelectWidget(data, choices, isMultiple, dataCxt.parentDataProperty, dataCxt.parentData);
                        
                    case 'file':
                        return validateFileWidget(data, dataCxt.parentDataProperty, dataCxt.parentData);
                        
                    case 'relation':
                        return validateRelationWidget(data, typeSelect, typeRelation, dataCxt.parentDataProperty, dataCxt.parentData);
                        
                    case 'boolean':
                        return validateBooleanWidget(data, defaultValue, dataCxt.parentDataProperty, dataCxt.parentData);
                        
                    case 'numberInput':
                        return validateNumberWidget(data, defaultValue, dataCxt.parentDataProperty, dataCxt.parentData);
                        
                    case 'shortAnswer':
                    case 'textarea':
                    case 'UriKeyGen':
                    case 'color':
                        return validateStringWidget(data, dataCxt.parentDataProperty);
                        
                    default:
                        return true;
                }
            };
        }
    });
    
    // Required field validation
    ajv.addKeyword({
        keyword: "customRequired",
        type: "object",
        schemaType: "object",
        compile: (schema) => {
            return function validate(data: any, dataCxt: any) {
                const { required = [], properties = {}, isUpdate = false } = schema;
                
                if (!isUpdate) {
                    for (const field of required) {
                        const fieldSchema = properties[field];
                        const fieldValue = data[field];
                        
                        // Skip if has default or is boolean
                        if (fieldSchema?.default !== undefined || fieldSchema?.widget === 'boolean') {
                            continue;
                        }
                        
                        if (isEmptyValue(fieldValue)) {
                            throw new Error(`Field "${field}" is required but missing.`);
                        }
                    }
                }
                
                return true;
            };
        }
    });
    
    // Dependencies handling
    ajv.addKeyword({
        keyword: "customDependencies",
        type: "object",
        schemaType: "object",
        modifying: true,
        compile: (schema) => {
            return function validate(data: any, dataCxt: any) {
                const { dependencies = {}, isUpdate = false } = schema;
                return processDependencies(data, dependencies, isUpdate);
            };
        }
    });
    
    // AllOf processing
    ajv.addKeyword({
        keyword: "customAllOf",
        type: "object",
        schemaType: "array",
        modifying: true,
        compile: (schema) => {
            return function validate(data: any, dataCxt: any) {
                return processAllOf(data, schema, dataCxt.rootData.isUpdate || false);
            };
        }
    });
}

// Widget validation functions
function validateSelectWidget(data: any, choices: any[], isMultiple: boolean, propertyName: string, parentData: any): boolean {
    if (!choices || !Array.isArray(choices)) return true;
    
    const validChoices = choices.map(choice => choice.value);
    
    if (isMultiple) {
        let valueArray = Array.isArray(data) ? data : [data];
        const invalidValues = valueArray.filter(v => !validChoices.includes(v));
        
        if (invalidValues.length > 0) {
            throw new Error(`Invalid value for field "${propertyName}". Expected one of: ${validChoices.join(', ')}`);
        }
        
        parentData[propertyName] = valueArray;
    } else {
        let singleValue = Array.isArray(data) ? data[0] : data;
        
        if (Array.isArray(data) && data.length > 1) {
            throw new HttpError(`Invalid value for field "${propertyName}". Expected a single value.`, 400);
        }
        
        if (!validChoices.includes(singleValue)) {
            throw new Error(`Invalid value for field "${propertyName}". Expected one of: ${validChoices.join(', ')}`);
        }
        
        parentData[propertyName] = [singleValue];
    }
    
    return true;
}

function validateFileWidget(data: any, propertyName: string, parentData: any): boolean {
    let fileArray = [];
    
    if (data) {
        fileArray = Array.isArray(data) ? data : [data];
        
        // Validate MongoDB IDs
        for (const fileId of fileArray) {
            if (!isMongoId(fileId)) {
                throw new Error(`Invalid value for field "${propertyName}". Expected a valid MongoDB ID.`);
            }
        }
    }
    
    parentData[propertyName] = fileArray;
    return true;
}

function validateRelationWidget(data: any, typeSelect: string, typeRelation: any, propertyName: string, parentData: any): boolean {
    if (!data) return true;
    
    if (typeSelect === 'multiple') {
        let relationArray = Array.isArray(data) ? data : [data];
        
        for (const relationId of relationArray) {
            if (!isMongoId(relationId)) {
                throw new Error(`Invalid relation ID for field "${propertyName}". Expected a valid MongoDB ID.`);
            }
        }
        
        parentData[propertyName] = relationArray;
    } else {
        let singleRelation = Array.isArray(data) ? data[0] : data;
        
        if (Array.isArray(data) && data.length > 1) {
            throw new HttpError(`Invalid value for field "${propertyName}". Expected a single value.`, 400);
        }
        
        if (!isMongoId(singleRelation)) {
            throw new Error(`Invalid relation ID for field "${propertyName}". Expected a valid MongoDB ID.`);
        }
        
        parentData[propertyName] = singleRelation;
    }
    
    return true;
}

function validateBooleanWidget(data: any, defaultValue: any, propertyName: string, parentData: any): boolean {
    if (data === undefined || data === null) {
        if (defaultValue !== undefined) {
            parentData[propertyName] = defaultValue;
        }
    } else {
        if (typeof data === 'string' && data === 'false') {
            parentData[propertyName] = false;
        } else {
            parentData[propertyName] = Boolean(data);
        }
    }
    
    return true;
}

function validateNumberWidget(data: any, defaultValue: any, propertyName: string, parentData: any): boolean {
    if (isNaN(data)) {
        if (!isNaN(defaultValue)) {
            parentData[propertyName] = Number(defaultValue);
        } else {
            throw new Error(`Invalid value for field "${propertyName}". Expected a number.`);
        }
    } else {
        parentData[propertyName] = Number(data);
    }
    
    return true;
}

function validateStringWidget(data: any, propertyName: string): boolean {
    if (data !== null && typeof data !== 'string') {
        throw new Error(`Invalid value for field "${propertyName}". Expected a string. Actual: ${typeof data}`);
    }
    
    return true;
}

// Helper functions
function isEmptyValue(value: any): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true;
    
    return false;
}

function processDependencies(data: any, dependencies: any, isUpdate: boolean): boolean {
    Object.keys(dependencies).forEach(dependentField => {
        const dependentValue = data[dependentField];
        if (dependentValue === undefined || dependentValue === null) return;
        
        const dependency = dependencies[dependentField];
        
        if (dependency.oneOf) {
            processOneOfDependency(data, dependentField, dependentValue, dependency, isUpdate);
        }
    });
    
    return true;
}

function processOneOfDependency(data: any, dependentField: string, dependentValue: any, dependency: any, isUpdate: boolean): void {
    let matchedSchema = null;
    let allDependentFields = new Set<string>();
    
    // Collect all dependent fields
    dependency.oneOf.forEach((variant: any) => {
        Object.keys(variant.properties).forEach(propKey => {
            if (propKey !== dependentField) {
                allDependentFields.add(propKey);
            }
        });
    });
    
    // Find matching schema
    for (const variant of dependency.oneOf) {
        if (variant.properties[dependentField]?.enum?.includes(dependentValue)) {
            matchedSchema = variant;
            
            // Set unrelated fields to null
            allDependentFields.forEach(fieldName => {
                if (!variant.properties[fieldName]) {
                    data[fieldName] = null;
                }
            });
            
            // Process additional properties
            processVariantProperties(data, variant, isUpdate);
            break;
        }
    }
}

function processVariantProperties(data: any, variant: any, isUpdate: boolean): void {
    const additionalRequiredFields = variant.required || [];
    
    Object.keys(variant.properties).forEach(propKey => {
        const propSchema = variant.properties[propKey];
        const propValue = data[propKey];
        
        // Check required fields
        if (additionalRequiredFields.includes(propKey) && 
            isEmptyValue(propValue) && !isUpdate) {
            throw new HttpError(
                `Field "${propKey}" is required when dependent field condition is met.`,
                400
            );
        }
        
        // Process field value
        if (propValue !== undefined && propValue !== null) {
            processFieldByWidget(data, propKey, propSchema, propValue, isUpdate);
        } else {
            data[propKey] = null;
        }
    });
}

function processAllOf(data: any, allOfSchemas: any[], isUpdate: boolean): boolean {
    allOfSchemas.forEach((condition, index) => {
        if (condition.if && condition.then) {
            // Process if-then conditions
            const conditionMet = checkIfCondition(data, condition.if);
            
            if (conditionMet) {
                processThenSchema(data, condition.then, isUpdate, index);
            }
        } else {
            // Process regular schema conditions
            processRegularSchema(data, condition, isUpdate);
        }
    });
    
    return true;
}

function checkIfCondition(data: any, ifCondition: any): boolean {
    if (!ifCondition.properties) return false;
    
    return Object.keys(ifCondition.properties).every(propKey => {
        const propCondition = ifCondition.properties[propKey];
        const propValue = data[propKey];
        
        if (propCondition.contains) {
            if (Array.isArray(propValue) && propCondition.contains.const) {
                return propValue.includes(propCondition.contains.const);
            }
            return false;
        }
        
        return true;
    });
}

function processThenSchema(data: any, thenSchema: any, isUpdate: boolean, conditionIndex: number): void {
    if (thenSchema.properties) {
        Object.keys(thenSchema.properties).forEach(propKey => {
            if (data[propKey] !== undefined && !data.hasOwnProperty(propKey)) {
                const propSchema = thenSchema.properties[propKey];
                processFieldByWidget(data, propKey, propSchema, data[propKey], isUpdate);
            }
        });
    }
    
    // Check required fields
    if (thenSchema.required && !isUpdate) {
        thenSchema.required.forEach((requiredField: string) => {
            if (isEmptyValue(data[requiredField])) {
                throw new HttpError(
                    `Field "${requiredField}" is required based on condition ${conditionIndex + 1}.`,
                    400
                );
            }
        });
    }
}

function processRegularSchema(data: any, schema: any, isUpdate: boolean): void {
    if (schema.properties) {
        Object.keys(schema.properties).forEach(propKey => {
            const propSchema = schema.properties[propKey];
            const propValue = data[propKey];
            
            if (propValue !== undefined && propValue !== null && !data.hasOwnProperty(propKey + '_processed')) {
                processFieldByWidget(data, propKey, propSchema, propValue, isUpdate);
                data[propKey + '_processed'] = true; // Mark as processed
            }
        });
    }
    
    if (schema.required && !isUpdate) {
        schema.required.forEach((requiredField: string) => {
            if (isEmptyValue(data[requiredField])) {
                throw new HttpError(
                    `Field "${requiredField}" is required based on schema condition.`,
                    400
                );
            }
        });
    }
}

function processFieldByWidget(data: any, fieldKey: string, fieldSchema: any, fieldValue: any, isUpdate: boolean): void {
    const { widget } = fieldSchema;
    
    switch (widget) {
        case 'select':
            validateSelectWidget(fieldValue, fieldSchema.choices, fieldSchema.isMultiple, fieldKey, data);
            break;
            
        case 'relation':
            validateRelationWidget(fieldValue, fieldSchema.typeSelect, fieldSchema.typeRelation, fieldKey, data);
            break;
            
        case 'numberInput':
            validateNumberWidget(fieldValue, fieldSchema.default, fieldKey, data);
            break;
            
        case 'boolean':
            validateBooleanWidget(fieldValue, fieldSchema.default, fieldKey, data);
            break;
            
        case 'shortAnswer':
        case 'textarea':
            if (typeof fieldValue !== 'string') {
                throw new Error(`Invalid value for field "${fieldKey}". Expected a string.`);
            }
            data[fieldKey] = fieldValue;
            break;
            
        default:
            data[fieldKey] = fieldValue;
            break;
    }
}

function convertSchemaToAjv(jsonSchema: any, isUpdate: boolean = false): any {
    const ajvSchema: any = {
        type: "object",
        properties: {},
        additionalProperties: false,
    };
    
    // Add custom validation keywords
    ajvSchema.customRequired = {
        required: jsonSchema.required || [],
        properties: jsonSchema.properties || {},
        isUpdate: isUpdate
    };
    
    if (jsonSchema.dependencies) {
        ajvSchema.customDependencies = {
            dependencies: jsonSchema.dependencies,
            isUpdate: isUpdate
        };
    }
    
    if (jsonSchema.allOf) {
        ajvSchema.customAllOf = jsonSchema.allOf;
    }
    
    // Convert properties
    if (jsonSchema.properties) {
        Object.keys(jsonSchema.properties).forEach(key => {
            const prop = jsonSchema.properties[key];
            ajvSchema.properties[key] = convertProperty(prop);
        });
    }
    
    return ajvSchema;
}

function convertProperty(prop: any): any {
    const converted: any = {
        type: prop.type || "string"
    };
    
    // Add default values
    if (prop.default !== undefined) {
        converted.default = prop.default;
    }
    
    // Add widget validation
    if (prop.widget) {
        converted.widgetValidation = {
            widget: prop.widget,
            choices: prop.choices,
            isMultiple: prop.isMultiple,
            typeSelect: prop.typeSelect,
            typeRelation: prop.typeRelation,
            default: prop.default
        };
    }
    
    // Handle nested objects
    if (prop.type === 'object' && prop.properties) {
        converted.properties = {};
        Object.keys(prop.properties).forEach(nestedKey => {
            converted.properties[nestedKey] = convertProperty(prop.properties[nestedKey]);
        });
        
        if (prop.required) {
            converted.required = prop.required;
        }
    }
    
    // Handle date widgets
    if (prop.widget?.includes('date')) {
        converted.format = 'date-time';
    }
    
    return converted;
}

function processDateFields(data: any, properties: any): void {
    Object.keys(properties).forEach(key => {
        const prop = properties[key];
        
        if (prop.widget?.includes('date') && data[key]) {
            data[key] = new Date(appSettings.timeZoneMongoDB.getCustomTime(data[key]));
        }
        
        // Process nested objects
        if (prop.type === 'object' && prop.properties && data[key]) {
            processDateFields(data[key], prop.properties);
        }
    });
}

// Main filter function
export function filterData(jsonSchema: any, body: any, is_update: boolean = false): any {
    try {
        // Create AJV instance
        const ajv = createAjvInstance();
        
        // Convert to AJV schema
        const ajvSchema = convertSchemaToAjv(jsonSchema, is_update);
        
        // Add isUpdate to root data for access in keywords
        const dataWithContext: any = { ...body, isUpdate: is_update };
        
        // Compile and validate
        const validate = ajv.compile(ajvSchema);
        const isValid = validate(dataWithContext);
        
        if (!isValid) {
            const errorMessages = validate.errors?.map(err => 
                `${err.instancePath || 'root'}: ${err.message}`
            ).join(', ') || 'Validation failed';
            
            throw new HttpError(errorMessages, 400);
        }
        
        // Cast back to any since we know validation passed
        const validatedData = dataWithContext as any;
        
        // Remove context data
        delete validatedData.isUpdate;
        
        // Process date fields
        processDateFields(validatedData, jsonSchema.properties || {});
        
        return validatedData;
        
    } catch (error: any) {
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError(error.message || 'Validation failed', 400);
    }
}

// Usage examples:
/*
// Basic usage (same as before)
const filteredData = filterData(tenantSchema.json_schema, requestBody, false);

// For updates
const updatedData = filterData(tenantSchema.json_schema, requestBody, true);
*/