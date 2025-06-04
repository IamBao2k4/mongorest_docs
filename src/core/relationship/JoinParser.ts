import { RelationshipRegistry } from "./RelationshipRegistry";
import { EmbedRequest, RelationshipDefinition } from "./types";

/**
 * Parser for join/embedding expressions
 */
export class JoinParser {
  private registry: RelationshipRegistry;

  constructor(registry: RelationshipRegistry) {
    this.registry = registry;
  }

  /**
   * Parse embedding expression like "posts(id,title,comments(id,content))"
   */
  parseEmbedExpression(sourceTable: string, expression: string): EmbedRequest | null {
    // Extract table name and hint
    const match = expression.match(/^([^!(]+)(!([^(]+))?(\([^)]*\))?(.*)$/);
    if (!match) return null;

    const tableName = match[1].trim();
    const joinHint = match[3];
    const fieldsContent = match[4] ? match[4].slice(1, -1) : ''; // Remove parentheses

    // Check if relationship exists
    if (!this.registry.has(sourceTable, tableName)) {
      console.warn(`Relationship ${sourceTable}.${tableName} not found in registry`);
      return null;
    }

    // Parse fields (simplified - can be enhanced for nested embeds)
    const fields = fieldsContent ? 
      fieldsContent.split(',').map(f => f.trim()).filter(f => f && !f.includes('(')) : 
      [];

    return {
      table: tableName,
      fields,
      joinHint: joinHint || 'left'
    };
  }

  /**
   * Generate MongoDB lookup stages for embed request
   */
  generateLookupStages(sourceTable: string, embedRequest: EmbedRequest): any[] {
    const relationship = this.registry.get(sourceTable, embedRequest.table);
    if (!relationship) {
      throw new Error(`Relationship ${sourceTable}.${embedRequest.table} not found`);
    }

    const lookupStage = relationship.generateLookupStage(embedRequest);
    
    // Handle array vs single result
    const stages = Array.isArray(lookupStage) ? lookupStage : [lookupStage];
    
    // Add unwind stage for many-to-one relationships if needed
    if (!relationship.isMultiResult() && embedRequest.joinHint === 'inner') {
      stages.push({
        $unwind: {
          path: `$${embedRequest.alias || embedRequest.table}`,
          preserveNullAndEmptyArrays: false
        }
      });
    } else if (!relationship.isMultiResult()) {
      // For left joins, convert array to single object
      stages.push({
        $addFields: {
          [embedRequest.alias || embedRequest.table]: {
            $arrayElemAt: [`$${embedRequest.alias || embedRequest.table}`, 0]
          }
        }
      });
    }

    return stages;
  }
}
