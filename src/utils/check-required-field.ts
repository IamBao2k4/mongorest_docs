export interface SchemaField {
    type: string;
    is_array?: boolean;
    required?: boolean;
    is_filter?: boolean;
    text_type?: string;
    min?: number;
    max?: number;
    root_field?: string;
    items?: Record<string, SchemaField>;
    select_values?: string;
    entity?: string;
    relation_type?: string;
}

export interface Schema {
    type: string;
    items: Record<string, SchemaField>;
}

export const checkRequiredFields = (data: any, schema: Schema): string[] => {
    
    const missingFields: string[] = [];

    const checkFields = (data: any, schemaItems: Record<string, SchemaField>, path: string[] = []): void => {
        for (const key in schemaItems) {
            const field = schemaItems[key];
            const currentPath = [...path, key].join('.');

            if (
                field.required
                && (
                    data[key] === undefined
                    || data[key] === null
                    || data[key] === ''
                    || (field.type === 'object' && field.is_array && (data[key] || []).length === 0)
                    || (Array.isArray(data[key]) && data[key].length === 0)
                    || (typeof data[key] === 'object' && !Array.isArray(data[key]) && Object.keys(data[key]).length === 0)
                )
            ) {
                missingFields.push(currentPath);
            }

            if (field.type === 'object' && field.items && field.is_array && data[key]) {
                for (let i = 0; i < data[key].length; i++) {
                    checkFields(data[key][i], field.items, [...path, key]);
                }
            }

        }
    };

    checkFields(data, schema.items);
    return missingFields;
};