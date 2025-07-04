---
sidebar_position: 2
---

# Support Plugin

Plugin Support trong MongoREST được xây dựng với kiến trúc modular và extensible, cho phép dễ dàng mở rộng chức năng.

## Plugin Architecture

### Base Classes Structure

```typescript
// Base class cho tất cả plugins
export abstract class PluginBase {
    protected metadata: PluginMetadata;
    protected type: PluginType;
    protected options: PluginOptions;

    constructor(metadata: PluginMetadata, type: PluginType, options: PluginOptions = {}) {
        this.metadata = metadata;
        this.type = type;
        this.options = options;
    }

    public abstract execute(data: any, context?: any): any;
}
```

### Plugin Types

```typescript
export enum PluginType {
    VALIDATOR = 'validator',
    TRANSFORMER = 'transformer', // hiện tại chỉ hỗ trợ loại plugin này
    HOOK = 'hook'
}
```

## Plugin Registry System

### Singleton Pattern Implementation

```typescript
export class PluginRegistry {
    private static instance: PluginRegistry;
    private plugins: Map<string, PluginBase>;

    public static getInstance(): PluginRegistry {
        if (!PluginRegistry.instance) {
            PluginRegistry.instance = new PluginRegistry();
        }
        return PluginRegistry.instance;
    }

    public register(name: string, plugin: PluginBase): void {
        if (this.plugins.has(name)) {
            throw new Error(`Plugin ${name} already registered`);
        }
        this.plugins.set(name, plugin);
    }
}
```

### Plugin Management

#### Registration
```typescript
const registry = PluginRegistry.getInstance();
registry.register('myPlugin', new MyPlugin());
```

#### Retrieval
```typescript
const plugin = registry.get('myPlugin');
if (plugin) {
    const result = await plugin.execute(data);
}
```

## Plugin Manager

### Execution Methods

#### Single Plugin Execution
```typescript
public async executePlugin(
    pluginName: string, 
    data: any, 
    context?: ExecutionContext
): Promise<any> {
    const plugin = this.registry.get(pluginName);
    if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found`);
    }
    return await plugin.execute(data, context);
}
```

#### Pipeline Execution
```typescript
public async executePipeline(
    pluginNames: string[], 
    data: any, 
    context?: ExecutionContext
): Promise<any> {
    let result = data;
    for (const pluginName of pluginNames) {
        result = await this.executePlugin(pluginName, result, context);
    }
    return result;
}
```

#### Type-based Execution
```typescript
public async executeByType(
    type: PluginType,
    data: any,
    context?: ExecutionContext
): Promise<any> {
    const plugins = this.getPluginsByType(type);
    let result = data;
    
    for (const [name, plugin] of plugins) {
        result = await plugin.execute(result, context);
    }
    
    return result;
}
```

## Plugin Loading

### Built-in Plugin Loading

```typescript
export class PluginLoader {
    public loadBuiltInPlugins(): void {
        this.registry.register('timestamp', new TimestampPlugin());
        this.registry.register('createdAt', new CreatedAtPlugin());
        this.registry.register('updatedAt', new UpdatedAtPlugin());
        this.registry.register('slug', new SlugPlugin());
        this.registry.register('uuid', new UuidPlugin());
        this.registry.register('version', new VersionPlugin());
        
        // Register as field plugins
        PluginConstants.registerFieldPlugin('timestamp');
        PluginConstants.registerFieldPlugin('createdAt');
        // ... etc
    }
}
```

### Custom Plugin Loading

```typescript
public loadCustomPlugin(
    name: string, 
    plugin: PluginBase, 
    isFieldPlugin: boolean = false
): void {
    this.registry.register(name, plugin);
    
    if (isFieldPlugin) {
        PluginConstants.registerFieldPlugin(name);
    }
}
```

## Field Plugin Constants

### Managing Field Plugins

```typescript
export class PluginConstants {
    private static fieldPlugins: Set<string> = new Set([
        'createdAt',
        'updatedAt', 
        'deletedAt',
        'timestamp',
        'slug',
        'uuid',
        'version'
    ]);

    public static isFieldPlugin(fieldName: string): boolean {
        return this.fieldPlugins.has(fieldName);
    }

    public static registerFieldPlugin(fieldName: string): void {
        this.fieldPlugins.add(fieldName);
    }
}
```

## Schema Processor Integration

### Field Plugin Extraction

```typescript
public extractFieldPlugins(schema: SchemaWithPlugins): Map<string, string[]> {
    const fieldPlugins = new Map<string, string[]>();

    for (const [fieldName, fieldValue] of Object.entries(schema)) {
        if (fieldValue === true && PluginConstants.isFieldPlugin(fieldName)) {
            fieldPlugins.set(fieldName, [fieldName]);
        }
    }

    return fieldPlugins;
}
```

### Processing Field Plugins

```typescript
public async processFieldPlugins(
    data: any,
    schema: SchemaWithPlugins,
    context?: ExecutionContext
): Promise<any> {
    const fieldPlugins = this.extractFieldPlugins(schema);
    let processedData = { ...data };

    for (const [fieldName, plugins] of fieldPlugins) {
        if (processedData[fieldName] === undefined || context?.operation === 'update') {
            for (const pluginName of plugins) {
                processedData = await this.pluginManager.executePlugin(
                    pluginName,
                    processedData,
                    context
                );
            }
        }
    }

    return processedData;
}
```

## Best Practices

1. **Always use TypeScript**: Leverage type safety
2. **Implement proper error handling**: Don't let plugins crash the system
3. **Use metadata**: Provide clear plugin information
4. **Follow single responsibility**: Each plugin should do one thing well
5. **Make plugins stateless**: Avoid side effects
6. **Document context requirements**: Be clear about what context a plugin needs

## Performance Optimization

1. **Lazy Loading**: Load plugins only when needed
2. **Caching**: Cache plugin results when appropriate
3. **Batch Processing**: Process multiple items efficiently
4. **Memory Management**: Clean up resources properly