---
sidebar_position: 5
---

# Custom Plugin

Hướng dẫn chi tiết cách tạo custom plugins cho MongoREST.

## Plugin Structure

### Basic Plugin Template

```typescript
import { TransformerPlugin, PluginMetadata } from '@mongorest/plugin';

export class MyCustomPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'myPlugin',
            version: '1.0.0',
            description: 'My custom plugin description',
            author: 'Your Name'
        };
        super(metadata);
    }

    public transform(data: any, context?: any): any {
        // Your transformation logic here
        return data;
    }
}
```

## Plugin Types

### 1. Transformer Plugin Example

```typescript
export class CapitalizePlugin extends TransformerPlugin {
    constructor() {
        super({
            name: 'capitalize',
            version: '1.0.0',
            description: 'Capitalize first letter of strings'
        });
    }

    public transform(data: any, context?: any): any {
        if (typeof data === 'string') {
            return data.charAt(0).toUpperCase() + data.slice(1);
        }
        
        if (context?.field && data && typeof data === 'object') {
            const fieldValue = data[context.field];
            if (typeof fieldValue === 'string') {
                return {
                    ...data,
                    [context.field]: fieldValue.charAt(0).toUpperCase() + fieldValue.slice(1)
                };
            }
        }
        
        return data;
    }
}
```

## Plugin Registration

### 1. Basic Registration

```typescript
import { PluginLoader } from '@mongorest/plugin';

const loader = new PluginLoader();

// Register as regular plugin
loader.loadCustomPlugin('capitalize', new CapitalizePlugin());

// Register as field plugin
loader.loadCustomPlugin('autoIncrement', new CounterPlugin(), true);
```

### 2. Plugin Module

```typescript
// my-plugins/index.ts
export * from './CapitalizePlugin';
export * from './PhoneNumberPlugin';
export * from './MaskPlugin';
export * from './AuditLogPlugin';

export function registerAll(loader: PluginLoader): void {
    // Register all plugins from this module
}
```

## Using Custom Plugins

### 1. In Schema Definition

```json
{
  "collection": "users",
  "properties": {
    "name": {
      "type": "string",
      "mongorest:plugins": ["trim", "capitalize"]
    },
    "phone": {
      "type": "string",
      "mongorest:validators": ["phoneNumber"]
    },
    "creditCard": {
      "type": "string",
    }
  },
  
  "auditlog": true,
}
```

### 2. Programmatic Usage

```typescript
const { pluginManager } = setupPlugins();

// Single plugin execution
const capitalizedName = await pluginManager.executePlugin(
    'capitalize',
    'john doe'
);
```

## Plugin Lifecycle

1. **Initialization**: Plugin được tạo và register
2. **Configuration**: Load configuration từ schema hoặc context
3. **Execution**: Transform/validate/hook được gọi
4. **Cleanup**: Resources được giải phóng (nếu cần)

## Distribution

### Usage

```typescript
import { MyCustomPlugin } from '@mycompany/mongorest-plugins';

const loader = new PluginLoader();
loader.loadCustomPlugin('myPlugin', new MyCustomPlugin());
```
