import { ValidatorPlugin, PluginMetadata } from '../base';
import { DateValidate } from '../dateFormatValidate/dateValidate';

export class DateFormatPlugin extends ValidatorPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'dateFormat',
            version: '1.0.0',
            description: 'Validate date format'
        };
        super(metadata);
    }

    public validate(data: any, context?: any): boolean {
        if (typeof data === 'string') {
            const dateValidator = new DateValidate(data);
            return dateValidator.isValidDateFormat();
        }
        
        if (context?.field && data && typeof data === 'object') {
            const fieldValue = data[context.field];
            if (typeof fieldValue === 'string') {
                const dateValidator = new DateValidate(fieldValue);
                return dateValidator.isValidDateFormat();
            }
        }
        
        return false;
    }
}

export class RequiredPlugin extends ValidatorPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'required',
            version: '1.0.0',
            description: 'Validate required fields'
        };
        super(metadata);
    }

    public validate(data: any, context?: any): boolean {
        if (context?.field) {
            const value = data[context.field];
            return value !== undefined && value !== null && value !== '';
        }
        
        return data !== undefined && data !== null && data !== '';
    }
}

export class EmailPlugin extends ValidatorPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'email',
            version: '1.0.0',
            description: 'Validate email format'
        };
        super(metadata);
    }

    public validate(data: any, context?: any): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (typeof data === 'string') {
            return emailRegex.test(data);
        }
        
        if (context?.field && data && typeof data === 'object') {
            const fieldValue = data[context.field];
            return typeof fieldValue === 'string' && emailRegex.test(fieldValue);
        }
        
        return false;
    }
}
