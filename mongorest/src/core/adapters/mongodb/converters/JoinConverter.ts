import { JoinClause } from '../../../types/intermediateQuery';
import { RelationshipRegistry } from '../../base/relationship/RelationshipRegistry';
import { FilterConverter } from './FilterConverter';

export class JoinConverter {
  private relationshipRegistry?: RelationshipRegistry;

  constructor(relationshipRegistry?: RelationshipRegistry) {
    this.relationshipRegistry = relationshipRegistry;
  }

  /**
   * Convert joins to MongoDB lookup stages
   */
  convertJoins(joins: JoinClause[], sourceCollection: string): any[] {
    const stages: any[] = [];
    joins.forEach(join => {
      const lookupStages = this.convertSingleJoin(join, sourceCollection);
      if (lookupStages) {
        if (Array.isArray(lookupStages)) {
          stages.push(...lookupStages);
        } else {
          stages.push(lookupStages);
        }
      }
    });

    return stages;
  }

  /**
   * Convert single join to MongoDB lookup
   */
  private convertSingleJoin(join: JoinClause, sourceCollection: string): any | null {
    // Handle relationship-based joins
    console.log("joincc", join);
    if (join.relationship && this.relationshipRegistry) {
      const relationships = this.relationshipRegistry.getForTable ? 
        this.relationshipRegistry.getForTable(sourceCollection) :
        [];
      const relationship = relationships.find((rel: any) => rel.name === join.relationship!.name);
      if (relationship) {
        return this.createRelationshipLookup(join, relationship);
      }
    }

    // Fallback to manual join conditions
    if (join.on && join.on.length > 0) {
      const condition = join.on[0];
      return {
        $lookup: {
          from: join.target,
          localField: condition.local,
          foreignField: condition.foreign,
          as: join.alias || join.target
        }
      };
    }

    // Default simple lookup
    return {
      $lookup: {
        from: join.target,
        as: join.alias || join.target,
        pipeline: this.buildJoinPipeline(join)
      }
    };
  }

  private createRelationshipLookup(join: JoinClause, relationship: any): any {
    if (relationship.type === 'many-to-many' && relationship.junction) {
      // Many-to-many relationship with junction table
      const junctionPipeline = [
        {
          $match: {
            $expr: {
              $eq: [`$${relationship.junction.localKey}`, '$$local_value']
            }
          }
        }
      ];

      const targetPipeline = [
        {
          $match: {
            $expr: {
              $in: [`$${relationship.foreignField}`, '$$junction_ids']
            }
          }
        }
      ];

      // Add filters if specified  
      if (join.filter) {
        targetPipeline.push({
          $match: FilterConverter.convertFilter(join.filter)
        });
      }

      // Add nested joins if any
      if (join.joins && join.joins.length > 0) {
        join.joins.forEach(nestedJoin => {
          const nestedLookups = this.convertSingleJoin(nestedJoin, join.target);
          if (Array.isArray(nestedLookups)) {
            targetPipeline.push(...nestedLookups);
          } else if (nestedLookups) {
            targetPipeline.push(nestedLookups);
          }
        });
      }

      // Return compound lookup: first junction, then target
      return [
        // First lookup: get junction records
        {
          $lookup: {
            from: relationship.junction.table,
            let: { local_value: `$${relationship.localField}` },
            pipeline: junctionPipeline,
            as: '_junction'
          }
        },
        // Second lookup: get target records using junction IDs
        {
          $lookup: {
            from: join.target,
            let: { 
              junction_ids: {
                $map: {
                  input: '$_junction',
                  as: 'j',
                  in: `$$j.${relationship.junction.foreignKey}`
                }
              }
            },
            pipeline: targetPipeline,
            as: join.alias || join.target
          }
        },
        // Clean up junction data
        {
          $unset: '_junction'
        }
      ];
    } else {
      // One-to-one, one-to-many, many-to-one
      const pipeline = [
        {
          $match: {
            $expr: {
              $eq: [`$${relationship.foreignField}`, '$$local_value']
            }
          }
        }
      ];

      // Add filters if specified
      if (join.filter) {
        pipeline.push({
          $match: FilterConverter.convertFilter(join.filter)
        });
      }

      // Add nested joins if any
      if (join.joins && join.joins.length > 0) {
        join.joins.forEach(nestedJoin => {
          const nestedLookups = this.convertSingleJoin(nestedJoin, join.target);
          if (Array.isArray(nestedLookups)) {
            pipeline.push(...nestedLookups);
          } else if (nestedLookups) {
            pipeline.push(nestedLookups);
          }
        });
      }

      const lookup = {
        $lookup: {
          from: join.target,
          let: { local_value: `$${relationship.localField}` },
          pipeline: pipeline,
          as: join.alias || join.target
        }
      };

      // Handle unwind for one-to-one and many-to-one
      if (relationship.type === 'one-to-one' || relationship.type === 'many-to-one') {
        return [
          lookup,
          {
            $unwind: {
              path: `$${join.alias || join.target}`,
              preserveNullAndEmptyArrays: join.relationship?.preserveNull !== false
            }
          }
        ];
      }

      return lookup;
    }
  }

  private buildJoinPipeline(join: JoinClause): any[] {
    const pipeline: any[] = [];

    // Add filters
    if (join.filter) {
      pipeline.push({
        $match: FilterConverter.convertFilter(join.filter)
      });
    }

    // Add nested joins
    if (join.joins && join.joins.length > 0) {
      join.joins.forEach(nestedJoin => {
        const nestedLookups = this.convertSingleJoin(nestedJoin, join.target);
        if (Array.isArray(nestedLookups)) {
          pipeline.push(...nestedLookups);
        } else if (nestedLookups) {
          pipeline.push(nestedLookups);
        }
      });
    }

    return pipeline;
  }
}