import { Relationship } from "./mainRelationship";
import { ManyToManyRelationship } from "./manyToManyRelationship";
import { ManyToOneRelationship } from "./manyToOneRelationship";
import { OneToManyRelationship } from "./oneToManyRelationship";
import { OneToOneRelationship } from "./oneToOneRelationship";
import { RelationshipDefinition } from "./types";

/**
 * Registry để quản lý tất cả relationships
 */
export class RelationshipRegistry {
  private relationships: Map<string, Relationship> = new Map();

  /**
   * Register một relationship
   */
  register(sourceTable: string, relationship: Relationship): void {
    const key = `${sourceTable}.${relationship.name}`;
    this.relationships.set(key, relationship);
  }

  /**
   * Register relationship từ definition
   */
  registerFromDefinition(sourceTable: string, definition: RelationshipDefinition): void {
    let relationship: Relationship;

    switch (definition.type) {
      case 'one-to-one':
        relationship = new OneToOneRelationship(definition);
        break;
      case 'one-to-many':
        relationship = new OneToManyRelationship(definition);
        break;
      case 'many-to-one':
        relationship = new ManyToOneRelationship(definition);
        break;
      case 'many-to-many':
        relationship = new ManyToManyRelationship(definition);
        break;
      default:
        throw new Error(`Unknown relationship type: ${definition.type}`);
    }

    this.register(sourceTable, relationship);
  }

  /**
   * Get relationship
   */
  get(sourceTable: string, relationshipName: string): Relationship | undefined {
    const key = `${sourceTable}.${relationshipName}`;
    return this.relationships.get(key);
  }

  /**
   * Get all relationships for a table
   */
  getForTable(sourceTable: string): Relationship[] {
    const relationships: Relationship[] = [];
    const prefix = `${sourceTable}.`;
    
    for (const [key, relationship] of this.relationships) {
      if (key.startsWith(prefix)) {
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }

  /**
   * Check if relationship exists
   */
  has(sourceTable: string, relationshipName: string): boolean {
    const key = `${sourceTable}.${relationshipName}`;
    return this.relationships.has(key);
  }

  /**
   * Remove relationship
   */
  remove(sourceTable: string, relationshipName: string): boolean {
    const key = `${sourceTable}.${relationshipName}`;
    return this.relationships.delete(key);
  }

  /**
   * Clear all relationships
   */
  clear(): void {
    this.relationships.clear();
  }

  /**
   * Get all registered relationships
   */
  getAll(): Map<string, Relationship> {
    return new Map(this.relationships);
  }

  /**
   * Bulk register relationships from config
   */
  registerBulk(config: Record<string, RelationshipDefinition[]>): void {
    for (const [sourceTable, definitions] of Object.entries(config)) {
      definitions.forEach(definition => {
        this.registerFromDefinition(sourceTable, definition);
      });
    }
  }
}