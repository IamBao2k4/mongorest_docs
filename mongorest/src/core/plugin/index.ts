export * from './base';
export * from './pluginRegistry';
export * from './pluginManager';
export * from './pluginLoader';
export * from './pluginConstants';
export * from './schemaProcessor';

export * from './transformers';

export * from './dateFormatValidate/dateFormatValidate';
export * from './dateFormatValidate/dateRegexPatterns';
export * from './dateFormatValidate/dateValidate';

export { createdAt } from './createdAt';
export { updatedAt } from './updatedAt';
export { deletedAt } from './deletedAt';
export { timestamp } from './timestamp';
export { Slug } from './slug';

import { PluginLoader } from './pluginLoader';
import { PluginManager } from './pluginManager';
import { SchemaProcessor } from './schemaProcessor';

export interface PluginSetup {
    pluginManager: PluginManager;
    schemaProcessor: SchemaProcessor;
}

export function setupPlugins(config?: Record<string, any>): PluginSetup {
    const loader = new PluginLoader();
    loader.loadFromConfig(config || {});
    const pluginManager = new PluginManager();
    const schemaProcessor = new SchemaProcessor(pluginManager);
    
    return {
        pluginManager,
        schemaProcessor
    };
}
