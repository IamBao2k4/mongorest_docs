import { PluginManager } from './pluginManager';
import { PluginConstants } from './pluginConstants';
import { ExecutionContext } from './pluginManager';

export interface SchemaWithPlugins {
    [key: string]: any;
}

export class SchemaProcessor {
    private pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    public extractFieldPlugins(schema: SchemaWithPlugins): Map<string, string[]> {
        const fieldPlugins = new Map<string, string[]>();

        for (const [fieldName, fieldValue] of Object.entries(schema)) {
            if (fieldValue === true && PluginConstants.isFieldPlugin(fieldName)) {
                fieldPlugins.set(fieldName, [fieldName]);
            }
        }

        return fieldPlugins;
    }

    public async processFieldPlugins(
        data: any,
        schema: SchemaWithPlugins,
        context?: ExecutionContext
    ): Promise<any> {
        const fieldPlugins = this.extractFieldPlugins(schema);
        
        if (fieldPlugins.size === 0) {
            return data;
        }

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

    public async processHooks(
        data: any,
        hookName: string,
        hooks: string[] | undefined,
        context?: ExecutionContext
    ): Promise<any> {
        if (!hooks || hooks.length === 0) {
            return data;
        }

        let processedData = data;

        for (const pluginName of hooks) {
            if (PluginConstants.isFieldPlugin(pluginName)) {
                processedData = await this.pluginManager.executePlugin(
                    pluginName,
                    processedData,
                    context
                );
            } else {
                processedData = await this.pluginManager.executePlugin(
                    pluginName,
                    processedData,
                    context
                );
            }
        }

        return processedData;
    }

    public shouldAutoGenerateField(fieldName: string, fieldValue: any): boolean {
        return fieldValue === true && PluginConstants.isFieldPlugin(fieldName);
    }
}
