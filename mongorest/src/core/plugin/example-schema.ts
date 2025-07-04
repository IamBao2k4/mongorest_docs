import { setupPlugins, PluginConstants, TransformerPlugin, PluginMetadata } from './index';

// Example schemas with field plugins
const userSchema = {
    // Field plugins - when value is true and fieldName is a registered plugin
    "createdAt": true,      // Will auto-add createdAt field
    "updatedAt": true,      // Will auto-add updatedAt field
    "uuid": true,           // Will auto-add uuid field
    "version": true,        // Will auto-add version field
    
    // Regular fields
    "name": {
        "type": "string",
        "required": true
    },
    "email": {
        "type": "string",
        "required": true
    }
};

const postSchema = {
    // Using timestamp plugin (adds both createdAt and updatedAt)
    "timestamp": true,
    
    // Regular fields
    "title": {
        "type": "string",
        "required": true
    },
    "content": {
        "type": "string"
    },
    
    // Slug will be auto-generated
    "slug": true
};

// Example 1: Basic field plugin usage
async function basicFieldPluginExample() {
    console.log('=== Basic Field Plugin Example ===');
    
    const { pluginManager, schemaProcessor } = setupPlugins();
    
    // Process data with schema
    const userData = {
        name: "John Doe",
        email: "john@example.com"
    };
    
    const processedData = await schemaProcessor.processFieldPlugins(
        userData,
        userSchema,
        { operation: 'create' }
    );
    
    console.log('Original data:', userData);
    console.log('Processed data:', processedData);
    // Output will include: createdAt, updatedAt, uuid, version
}

// Example 2: Custom field plugin
class AutoIdPlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'autoId',
            version: '1.0.0',
            description: 'Auto-generate custom ID'
        };
        super(metadata);
    }
    
    public transform(data: any, context?: any): any {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const prefix = context?.prefix || 'ID';
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 7);
            
            return {
                ...data,
                autoId: `${prefix}-${timestamp}-${random}`
            };
        }
        return data;
    }
}

async function customFieldPluginExample() {
    console.log('\n=== Custom Field Plugin Example ===');
    
    const { pluginManager, schemaProcessor } = setupPlugins();
    
    // Register custom field plugin
    const loader = new (await import('./pluginLoader')).PluginLoader();
    loader.loadCustomPlugin('autoId', new AutoIdPlugin(), true); // true = field plugin
    
    // Schema with custom field plugin
    const customSchema = {
        "autoId": true,         // Our custom field plugin
        "createdAt": true,
        "title": {
            "type": "string"
        }
    };
    
    const data = { title: "My Post" };
    const processed = await schemaProcessor.processFieldPlugins(
        data,
        customSchema,
        { operation: 'create', prefix: 'POST' }
    );
    
    console.log('Processed with custom plugin:', processed);
}

// Example 3: Check available field plugins
function listAvailablePlugins() {
    console.log('\n=== Available Field Plugins ===');
    
    const allPlugins = PluginConstants.getAllFieldPlugins();
    console.log('Field plugins that can be used as "fieldName": true');
    allPlugins.forEach(plugin => {
        console.log(`- "${plugin}": true`);
    });
}

// Example 4: Schema validation helper
function validateSchemaPlugins(schema: any): string[] {
    const warnings: string[] = [];
    
    for (const [fieldName, fieldValue] of Object.entries(schema)) {
        if (fieldValue === true && !PluginConstants.isFieldPlugin(fieldName)) {
            warnings.push(`Warning: "${fieldName}: true" is not a registered field plugin`);
        }
    }
    
    return warnings;
}

// Example 5: CrudService integration simulation
async function crudServiceExample() {
    console.log('\n=== CrudService Integration Example ===');
    
    const { pluginManager, schemaProcessor } = setupPlugins();
    
    // Simulate create operation
    async function create(collection: string, data: any, schema: any) {
        // 1. Process field plugins
        let processedData = await schemaProcessor.processFieldPlugins(
            data,
            schema,
            { operation: 'create', collection }
        );
        
        // 2. Validate data (would be done by AJV)
        console.log('Data after field plugins:', processedData);
        
        // 3. Save to MongoDB (simulated)
        console.log('Would save to MongoDB:', collection);
        
        return processedData;
    }
    
    // Use the simulated create
    const result = await create('users', 
        { name: 'Jane Doe', email: 'jane@example.com' },
        userSchema
    );
}

// Run all examples
if (require.main === module) {
    (async () => {
        await basicFieldPluginExample();
        await customFieldPluginExample();
        listAvailablePlugins();
        
        console.log('\n=== Schema Validation Example ===');
        const testSchema = {
            "createdAt": true,      // Valid
            "customField": true,    // Invalid - not a registered plugin
            "updatedAt": true,      // Valid
            "name": { type: "string" }
        };
        const warnings = validateSchemaPlugins(testSchema);
        warnings.forEach(w => console.log(w));
        
        await crudServiceExample();
    })();
}
