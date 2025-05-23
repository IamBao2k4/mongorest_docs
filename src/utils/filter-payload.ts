import { Schema, SchemaField } from "./check-required-field";

export const filterDataBySchema = (data: any, schema: Schema): any => {
    const filterFields = (inputData: any, schemaItems: Record<string, SchemaField>): any => {
        if (typeof inputData !== 'object' || inputData === null) {
            return inputData;
        }
        if (Array.isArray(inputData)) {
            const arraySchema = Object.values(schemaItems)[0];
            if (arraySchema?.type === 'object' && arraySchema.items) {
                return inputData.map(item => filterFields(item, arraySchema.items || {}));
            }
            return inputData;
        }
        const filteredData: Record<string, any> = {};
        for (const key in schemaItems) {
            const field = schemaItems[key];
            if (inputData[key] === undefined) continue;
            
            if (field.type === 'object') {
                if (field.is_array) {
                    const arrayData = Array.isArray(inputData[key]) ? inputData[key] : [];
                    if (field.min !== undefined && field.min > arrayData.length) {
                        throw new Error(`Invalid min length for field ${key}`);
                    }
                    if (field.max !== undefined && field.max < arrayData.length) {
                        throw new Error(`Invalid max length for field ${key}`);
                    }
                    filteredData[key] = arrayData.map((item: any) => 
                        filterFields(item, field.items || {}));
                } else if (inputData[key] !== null) {
                    filteredData[key] = filterFields(inputData[key], field.items || {});
                } else {
                    filteredData[key] = null;
                }
            } else {
                filteredData[key] = validateAndTransformValue(inputData[key], field, key);
            }
        }
        return filteredData;
    };
    const validateAndTransformValue = (value: any, field: SchemaField, key: string): any => {
        switch (field.type) {
            case 'string':
                return validateString(value, field, key);
            case 'number':
                return validateNumber(value, field, key);
            case 'boolean':
                return Boolean(value);
            case 'select':
                return validateSelect(value, field, key);
            default:
                return value;
        }
    };
    const validateString = (value: any, field: SchemaField, key: string): string | Date => {
        let result = value;
        if (field.text_type === 'datetime') {
            result = new Date(value);
            if (isNaN(result.getTime())) {
                throw new Error(`Invalid date value for field ${key}`);
            }
            return result;
        }
        result = String(value).trim();
        if (field.text_type === 'email' && !result.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error(`Invalid email value for field ${key}`);
        }
        if (field.min !== undefined && field.min > result.length) {
            throw new Error(`Invalid min length for field ${key}`);
        }
        if (field.max !== undefined && field.max < result.length) {
            throw new Error(`Invalid max length for field ${key}`);
        }
        if(field.text_type === 'slug' && !result.match(/^[a-z0-9-]+$/)) {
            // convert to slug
            result = result.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        }
        return result;
    };
    const validateNumber = (value: any, field: SchemaField, key: string): number => {
        const result = Number(value);
        if (isNaN(result)) {
            throw new Error(`Invalid number value for field ${key}`);
        }
        if (field.min !== undefined && field.min > result) {
            throw new Error(`Invalid min value for field ${key}`);
        }
        if (field.max !== undefined && field.max < result) {
            throw new Error(`Invalid max value for field ${key}`);
        }
        return result;
    };
    const validateSelect = (value: any, field: SchemaField, key: string): any => {
        if (!field.select_values) {
            throw new Error(`Missing select values for field ${key}`);
        }
        const selectValues = field.select_values.split(',').map(option => {
            const parts = option.split(':');
            return parts.length > 1 ? parts[1] : option;
        });
        const valueArray = Array.isArray(value) ? value : [value];
        for (const v of valueArray) {
            if (!selectValues.includes(v)) {
                throw new Error(`Invalid select value "${v}" for field ${key}`);
            }
        }
        if (field.min !== undefined && field.min > valueArray.length) {
            throw new Error(`Invalid min selections for field ${key}`);
        }
        if (field.max !== undefined && field.max < valueArray.length) {
            throw new Error(`Invalid max selections for field ${key}`);
        }
        return valueArray;
    };
    return filterFields(data, schema.items);
};