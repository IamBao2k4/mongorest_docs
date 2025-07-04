# MongoREST Plugin System

## Overview
Plugin system cho phép tự động thêm fields vào documents dựa trên schema configuration.

## Basic Usage

### 1. Field Plugin Syntax
Trong schema, sử dụng `"fieldName": true` để kích hoạt field plugin:

```json
{
  "createdAt": true,    // Tự động thêm createdAt timestamp
  "updatedAt": true,    // Tự động thêm updatedAt timestamp
  "uuid": true,         // Tự động thêm UUID
  "version": true,      // Tự động thêm version number
  "timestamp": true,    // Thêm cả createdAt và updatedAt
  
  // Regular fields
  "name": {
    "type": "string",
    "required": true
  }
}
```

### 2. Available Field Plugins

| Plugin Name | Field Added | Description |
|------------|-------------|-------------|
| `createdAt` | createdAt | ISO timestamp khi tạo document |
| `updatedAt` | updatedAt | ISO timestamp khi update document |
| `timestamp` | createdAt, updatedAt | Thêm cả hai timestamps |
| `uuid` | uuid | UUID v4 unique identifier |
| `version` | version | Version number (1 for new, increment on update) |
| `slug` | slug | URL-friendly slug (cần context.sourceField) |

### 3. Integration với CrudService

```typescript
// Trong CrudService.create()
const { pluginManager, schemaProcessor } = setupPlugins();

// Process field plugins trước khi save
const processedData = await schemaProcessor.processFieldPlugins(
    inputData,
    schema,
    { operation: 'create', collection: 'users' }
);

// Validate và save to MongoDB
```

### 4. Custom Field Plugin

```typescript
// 1. Tạo plugin class
class MyFieldPlugin extends TransformerPlugin {
    constructor() {
        super({
            name: 'myField',
            version: '1.0.0',
            description: 'Add my custom field'
        });
    }
    
    transform(data: any, context?: any): any {
        return {
            ...data,
            myField: 'custom value'
        };
    }
}

// 2. Register as field plugin
const loader = new PluginLoader();
loader.loadCustomPlugin('myField', new MyFieldPlugin(), true);

// 3. Use in schema
{
  "myField": true,
  "name": { "type": "string" }
}
```

### 5. Check Available Plugins

```typescript
import { PluginConstants } from './pluginConstants';

// Get all field plugins
const plugins = PluginConstants.getAllFieldPlugins();
console.log(plugins); // ['createdAt', 'updatedAt', 'uuid', ...]

// Check if a field is a plugin
if (PluginConstants.isFieldPlugin('createdAt')) {
    // It's a valid field plugin
}
```

## Architecture

### Components

1. **PluginConstants**: Quản lý danh sách field plugins
2. **SchemaProcessor**: Xử lý schema và execute plugins
3. **PluginManager**: Execute plugins
4. **PluginLoader**: Load và register plugins

### Workflow

```
Schema Definition → SchemaProcessor → Extract Field Plugins → Execute Plugins → Add Fields → Save to MongoDB
```

### Example Schema

```json
{
  "collection": "posts",
  "properties": {
    "title": { "type": "string", "required": true },
    "content": { "type": "string" },
    "author": { "type": "string" }
  },
  
  // Field plugins
  "createdAt": true,
  "updatedAt": true,
  "uuid": true,
  "slug": true  // Will need sourceField in context
}
```

### Context Options

```typescript
interface ExecutionContext {
    operation: 'create' | 'update' | 'delete';
    collection: string;
    user?: any;
    
    // For slug plugin
    sourceField?: string;
    targetField?: string;
    
    // For autoId plugin
    prefix?: string;
}
```

## Best Practices

1. **Don't override existing values**: Plugins should check if field already exists
2. **Use context for configuration**: Pass options via context
3. **Register custom plugins properly**: Use `isFieldPlugin: true` flag
4. **Validate schema**: Check for invalid field plugins
5. **Handle errors gracefully**: Plugins should not break on invalid input

## Future Enhancements

- [ ] Plugin dependencies
- [ ] Plugin ordering
- [ ] Conditional plugins
- [ ] Plugin configuration in schema
- [ ] Async plugin support
- [ ] Plugin validation
