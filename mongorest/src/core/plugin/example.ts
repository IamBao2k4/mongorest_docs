import { setupPlugins, PluginManager, TransformerPlugin, PluginMetadata } from './index';

// Example 1: Basic usage with built-in plugins
async function basicExample() {
    // Setup plugins (loads built-in plugins)
    const pluginManager = setupPlugins();
    
    // Use a single plugin
    const data = { title: '  Hello World  ' };
    const trimmed = await pluginManager.executePlugin('trim', data);
    console.log(trimmed); // { title: 'Hello World' }
    
    // Use plugin pipeline
    const result = await pluginManager.executePipeline(
        ['trim', 'slug'],
        { title: '  Hello World  ' }
    );
    console.log(result); // { title: 'Hello World', slug: 'hello-world' }
}

// Example 2: Custom plugin
class UppercasePlugin extends TransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            name: 'uppercase',
            version: '1.0.0',
            description: 'Convert to uppercase'
        };
        super(metadata);
    }
    
    public transform(data: any): any {
        if (typeof data === 'string') {
            return data.toUpperCase();
        }
        return data;
    }
}

async function customPluginExample() {
    const pluginManager = setupPlugins();
    
    // Register custom plugin
    const uppercasePlugin = new UppercasePlugin();
    pluginManager['registry'].register('uppercase', uppercasePlugin);
    
    // Use custom plugin
    const result = await pluginManager.executePlugin('uppercase', 'hello');
    console.log(result); // 'HELLO'
}

// Example 3: Plugin with MongoDB schema
const userSchema = {
    properties: {
        name: {
            type: 'string',
            // Plugin syntax in schema
            'mongorest:plugins': ['trim']
        },
        email: {
            type: 'string',
            'mongorest:plugins': ['trim', 'lowercase']
        },
        slug: {
            type: 'string',
            'mongorest:plugins': [
                {
                    name: 'slug',
                    options: { sourceField: 'name' }
                }
            ]
        }
    },
    // Collection-level plugins
    'mongorest:hooks': {
        beforeCreate: ['timestamp'],
        beforeUpdate: ['updatedAt']
    }
};

// Example 4: Plugin chain syntax
async function pluginChainExample() {
    const pluginManager = setupPlugins();
    
    // Parse and execute plugin chain
    const result = await pluginManager.executePluginChain(
        '@trim | @lowercase',
        '  HELLO WORLD  '
    );
    console.log(result); // 'hello world'
}

// Run examples
if (require.main === module) {
    (async () => {
        console.log('=== Basic Example ===');
        await basicExample();
        
        console.log('\n=== Custom Plugin Example ===');
        await customPluginExample();
        
        console.log('\n=== Plugin Chain Example ===');
        await pluginChainExample();
    })();
}
