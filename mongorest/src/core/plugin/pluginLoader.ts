import { PluginRegistry } from './pluginRegistry';
import { PluginBase } from './base';
import { PluginConstants } from './pluginConstants';
import {
    TimestampPlugin,
    CreatedAtPlugin,
    UpdatedAtPlugin,
    SlugPlugin,
    TrimPlugin,
    LowercasePlugin,
    UuidPlugin,
    VersionPlugin
} from './transformers';

export class PluginLoader {
    private registry: PluginRegistry;

    constructor() {
        this.registry = PluginRegistry.getInstance();
    }

    public loadBuiltInPlugins(): void {
        this.registry.register('timestamp', new TimestampPlugin());
        this.registry.register('createdAt', new CreatedAtPlugin());
        this.registry.register('updatedAt', new UpdatedAtPlugin());
        this.registry.register('slug', new SlugPlugin());
        this.registry.register('uuid', new UuidPlugin());
        this.registry.register('version', new VersionPlugin());
        
        this.registry.register('trim', new TrimPlugin());
        this.registry.register('lowercase', new LowercasePlugin());
        
        PluginConstants.registerFieldPlugin('timestamp');
        PluginConstants.registerFieldPlugin('createdAt');
        PluginConstants.registerFieldPlugin('updatedAt');
        PluginConstants.registerFieldPlugin('slug');
        PluginConstants.registerFieldPlugin('uuid');
        PluginConstants.registerFieldPlugin('version');
    }

    public loadCustomPlugin(name: string, plugin: PluginBase, isFieldPlugin: boolean = false): void {
        this.registry.register(name, plugin);
        
        if (isFieldPlugin) {
            PluginConstants.registerFieldPlugin(name);
        }
    }

    public loadFromConfig(config: Record<string, any>): void {
        if (config.enableBuiltInPlugins !== false) {
            this.loadBuiltInPlugins();
        }
    }

    public getLoadedPlugins(): string[] {
        const plugins = this.registry.getAll();
        return Array.from(plugins.keys());
    }
}
