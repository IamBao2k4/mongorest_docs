export interface PluginOptions {
    [key: string]: any;
}

export interface PluginMetadata {
    name: string;
    version?: string;
    description?: string;
    author?: string;
}

export enum PluginType {
    VALIDATOR = 'validator',
    TRANSFORMER = 'transformer',
    HOOK = 'hook'
}

export abstract class PluginBase {
    protected metadata: PluginMetadata;
    protected type: PluginType;
    protected options: PluginOptions;

    constructor(metadata: PluginMetadata, type: PluginType, options: PluginOptions = {}) {
        this.metadata = metadata;
        this.type = type;
        this.options = options;
    }

    public getMetadata(): PluginMetadata {
        return this.metadata;
    }

    public getType(): PluginType {
        return this.type;
    }

    public getOptions(): PluginOptions {
        return this.options;
    }

    public abstract execute(data: any, context?: any): any;
}

export abstract class ValidatorPlugin extends PluginBase {
    constructor(metadata: PluginMetadata, options: PluginOptions = {}) {
        super(metadata, PluginType.VALIDATOR, options);
    }

    public abstract validate(data: any, context?: any): boolean;
    
    public execute(data: any, context?: any): boolean {
        return this.validate(data, context);
    }
}

export abstract class TransformerPlugin extends PluginBase {
    constructor(metadata: PluginMetadata, options: PluginOptions = {}) {
        super(metadata, PluginType.TRANSFORMER, options);
    }

    public abstract transform(data: any, context?: any): any;
    
    public execute(data: any, context?: any): any {
        return this.transform(data, context);
    }
}

export abstract class HookPlugin extends PluginBase {
    constructor(metadata: PluginMetadata, options: PluginOptions = {}) {
        super(metadata, PluginType.HOOK, options);
    }

    public abstract run(data: any, context?: any): any;
    
    public execute(data: any, context?: any): any {
        return this.run(data, context);
    }
}

export abstract class DateFormatValidateBase extends ValidatorPlugin {
    protected date: string;

    constructor(date: string) {
        super({
            name: 'DateFormatValidator',
            description: 'Base date format validator'
        });
        this.date = date;
    }

    public abstract isValid(): boolean;
    
    public validate(): boolean {
        return this.isValid();
    }
}
