import { PluginBase } from './base';

export class PluginRegistry {
    private static instance: PluginRegistry;
    private plugins: Map<string, PluginBase>;

    private constructor() {
        this.plugins = new Map();
    }

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

    public get(name: string): PluginBase | undefined {
        return this.plugins.get(name);
    }

    public has(name: string): boolean {
        return this.plugins.has(name);
    }

    public getAll(): Map<string, PluginBase> {
        return new Map(this.plugins);
    }

    public unregister(name: string): boolean {
        return this.plugins.delete(name);
    }

    public clear(): void {
        this.plugins.clear();
    }
}
