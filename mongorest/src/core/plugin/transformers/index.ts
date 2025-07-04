import { TransformerPlugin, PluginMetadata } from '../base';
import { DateValidate } from '../dateFormatValidate/dateValidate';

export class TimestampPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'timestamp',
            version: '1.0.0',
            description: 'Add createdAt and updatedAt timestamps'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        const date = new Date().toISOString();
        
        if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
                return data.map(item => this.transform(item, context));
            } else {
                return {
                    ...data,
                    createdAt: date,
                    updatedAt: date
                };
            }
        }
        return data;
    }
}

export class UuidPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'uuid',
            version: '1.0.0',
            description: 'Generate UUID v4'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            
            return {
                ...data,
                uuid: uuid
            };
        }
        return data;
    }
}

export class VersionPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'version',
            version: '1.0.0',
            description: 'Add version field'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const currentVersion = data.version || 0;
            return {
                ...data,
                version: context?.operation === 'create' ? 1 : currentVersion + 1
            };
        }
        return data;
    }
}

export class CreatedAtPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'createdAt',
            version: '1.0.0',
            description: 'Add createdAt timestamp'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        const date = context?.date || new Date().toISOString();
        
        if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
                return data.map(item => this.transform(item, context));
            } else {
                return {
                    ...data,
                    createdAt: date
                };
            }
        }
        return data;
    }
}

export class UpdatedAtPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'updatedAt',
            version: '1.0.0',
            description: 'Add updatedAt timestamp'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        const date = context?.date || new Date().toISOString();
        
        if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
                return data.map(item => this.transform(item, context));
            } else {
                return {
                    ...data,
                    updatedAt: date
                };
            }
        }
        return data;
    }
}

export class SlugPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'slug',
            version: '1.0.0',
            description: 'Generate URL-friendly slug from field'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        const sourceField = context?.sourceField || 'title';
        const targetField = context?.targetField || 'slug';
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const sourceValue = data[sourceField];
            if (sourceValue && typeof sourceValue === 'string') {
                let slug = sourceValue.toLowerCase();
                slug = slug.replace(/[^a-z0-9\s-]/g, '');
                slug = slug.replace(/\s+|-/g, '-');
                slug = slug.replace(/^-|-$/g, '');
                
                return {
                    ...data,
                    [targetField]: slug
                };
            }
        }
        
        return data;
    }
}

export class TrimPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'trim',
            version: '1.0.0',
            description: 'Trim whitespace from strings'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        if (typeof data === 'string') {
            return data.trim();
        }
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const trimmed: any = {};
            for (const [key, value] of Object.entries(data)) {
                trimmed[key] = typeof value === 'string' ? value.trim() : value;
            }
            return trimmed;
        }
        
        return data;
    }
}

export class LowercasePlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'lowercase',
            version: '1.0.0',
            description: 'Convert strings to lowercase'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        if (typeof data === 'string') {
            return data.toLowerCase();
        }
        
        if (context?.field && data && typeof data === 'object') {
            return {
                ...data,
                [context.field]: data[context.field]?.toLowerCase()
            };
        }
        
        return data;
    }
}
