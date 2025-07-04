import { PluginRegistry } from './pluginRegistry';
import { PluginBase, PluginType } from './base';

export interface ExecutionContext {
    collection?: string;
    operation?: string;
    user?: any;
    [key: string]: any;
}

export class PluginManager {
    private registry: PluginRegistry;

    constructor() {
        this.registry = PluginRegistry.getInstance();
    }

    public async executePlugin(
        pluginName: string, 
        data: any, 
        context?: ExecutionContext
    ): Promise<any> {
        const plugin = this.registry.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }

        try {
            return await plugin.execute(data, context);
        } catch (error: any) {
            throw new Error(`Plugin ${pluginName} execution failed: ${error.message}`);
        }
    }

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

    private getPluginsByType(type: PluginType): Map<string, PluginBase> {
        const filtered = new Map<string, PluginBase>();
        const allPlugins = this.registry.getAll();
        
        for (const [name, plugin] of allPlugins) {
            if (plugin.getType() === type) {
                filtered.set(name, plugin);
            }
        }
        
        return filtered;
    }

    public async executePluginChain(
        syntax: string,
        data: any,
        context?: ExecutionContext
    ): Promise<any> {
        const pluginNames = syntax
            .split('|')
            .map(s => s.trim())
            .filter(s => s.startsWith('@'))
            .map(s => s.substring(1));
            
        return this.executePipeline(pluginNames, data, context);
    }
}
