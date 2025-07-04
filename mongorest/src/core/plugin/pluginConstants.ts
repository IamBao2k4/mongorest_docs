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

    public static unregisterFieldPlugin(fieldName: string): boolean {
        return this.fieldPlugins.delete(fieldName);
    }

    public static getAllFieldPlugins(): string[] {
        return Array.from(this.fieldPlugins);
    }

    public static clearFieldPlugins(): void {
        this.fieldPlugins.clear();
    }

    public static resetToDefaults(): void {
        this.fieldPlugins = new Set([
            'createdAt',
            'updatedAt',
            'deletedAt',
            'timestamp',
            'slug',
            'uuid',
            'version'
        ]);
    }
}
