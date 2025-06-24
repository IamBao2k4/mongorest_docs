import { QueryParams } from "../index";
import { QueryConverter } from "../converter/queryConverter";
import {
  IntermediateQuery,
  IntermediateQueryResult,
} from "../types/intermediateQuery";
import {
  DatabaseAdapter,
  DatabaseType,
} from "../adapters/base/databaseAdapter";
import {
  AdapterRegistry,
  adapterRegistry,
} from "../adapters/base/adapterRegistry";
import { RbacValidator } from "../rbac/rbac-validator";
import { RelationshipRegistry } from "../adapters/base/relationship/RelationshipRegistry";
import { AuthorizationError, QueryError, NotFoundError, RelationshipError, wrapError } from "../errors";

/**
 * New core architecture with clean separation of concerns
 */
export class NewCore {
  private queryConverter: QueryConverter;
  private rbacValidator: RbacValidator;
  private adapterRegistry: AdapterRegistry;
  private relationshipRegistry?: RelationshipRegistry;

  constructor(
    relationshipRegistry?: RelationshipRegistry,
    customAdapterRegistry?: AdapterRegistry
  ) {
    this.relationshipRegistry = relationshipRegistry;
    this.queryConverter = new QueryConverter(this.relationshipRegistry);
    this.rbacValidator = new RbacValidator();
    this.adapterRegistry = customAdapterRegistry || adapterRegistry;

    // Load RBAC configuration
    this.rbacValidator.loadConfig();
  }

  /**
   * Main query processing method
   */
  async processQuery<T = any>(
    params: QueryParams,
    collection: string,
    roles: string[],
    databaseType: DatabaseType = "mongodb",
    adapterName?: string
  ): Promise<IntermediateQueryResult<T>> {
    // 1. Validate RBAC access
    if (!this.rbacValidator.hasAccess(collection, "read", roles)) {
      throw new AuthorizationError(
        `User does not have access to read on collection ${collection}`
      );
    }

    // 2. Convert URL params to intermediate JSON format
    const intermediateQuery = this.queryConverter.convert(
      params,
      collection,
      roles
    );

    // 3. Enhance query with relationship data
    this.enhanceQueryWithRelationships(intermediateQuery);

    // 4. Apply RBAC field restrictions
    this.applyRbacRestrictions(intermediateQuery, collection, roles);

    // 5. Get appropriate database adapter
    const adapter = this.getAdapter(databaseType, adapterName);

    // 6. Validate query against adapter capabilities
    const validation = adapter.validateQuery(intermediateQuery);
    if (!validation.valid) {
      throw new QueryError(
        `Query validation failed: ${validation.errors
          .map((e) => e.message)
          .join(", ")}`,
        { errors: validation.errors }
      );
    }

    // 7. Convert to native database query
    const nativeQuery = adapter.convertQuery(intermediateQuery);

    // 8. Set adapter context and execute query
    if ("setCurrentContext" in adapter && typeof (adapter as any).setCurrentContext === 'function') {
      try {
        (adapter as any).setCurrentContext(intermediateQuery);
      } catch (error) {
        throw wrapError(error, 'Failed to set adapter context');
      }
    }

    console.log("nativeQuery", JSON.stringify(nativeQuery));

    if (databaseType === "mongodb") {
      const projection: Record<string, number> = {};
      try {
        const features = this.rbacValidator.getRbacFeatures(collection, "read", roles);
        if (Array.isArray(features)) {
          features.forEach((f: string) => {
            if (typeof f === 'string') {
              projection[f] = 1;
            }
          });
        } else {
          throw new AuthorizationError("RBAC features must be an array");
        }
      } catch (error) {
        throw wrapError(error, 'Failed to get RBAC features');
      }

      if (Object.keys(projection).length > 0 && Array.isArray(nativeQuery)) {
        nativeQuery.push({
          $project: projection,
        });
      }
    }

    return adapter.executeQuery<T>(nativeQuery);
  }

  /**
   * Get list of supported database types
   */
  getSupportedDatabaseTypes(): DatabaseType[] {
    return this.adapterRegistry.getSupportedTypes();
  }

  /**
   * Get adapter information
   */
  getAdapterInfo(databaseType?: DatabaseType) {
    if (databaseType) {
      return this.adapterRegistry.listAdaptersByType(databaseType);
    }
    return this.adapterRegistry.listAdapters();
  }

  /**
   * Test adapter connection
   */
  async testConnection(
    databaseType: DatabaseType,
    adapterName?: string
  ): Promise<boolean> {
    const adapter = this.getAdapter(databaseType, adapterName);
    return adapter.testConnection();
  }

  /**
   * Initialize core with configuration
   */
  async initialize(config: CoreConfig): Promise<void> {
    // Initialize adapters
    if (config.adapters) {
      await this.adapterRegistry.initializeAll(config.adapters);
    }

    // Load relationship registry if provided
    if (config.relationships && this.relationshipRegistry) {
      this.relationshipRegistry.registerBulk(config.relationships);
    }

    // Update RBAC configuration if provided
    if (config.rbac) {
      // Update RBAC configuration
      this.rbacValidator.updateConfig(config.rbac);
    }
  }

  /**
   * Dispose of core resources
   */
  async dispose(): Promise<void> {
    await this.adapterRegistry.disposeAll();
  }

  /**
   * Get database adapter
   */
  private getAdapter(
    databaseType: DatabaseType,
    adapterName?: string
  ): DatabaseAdapter {
    const adapter = this.adapterRegistry.getAdapterByType(
      databaseType,
      adapterName
    );

    if (!adapter) {
      throw new NotFoundError(
        `No adapter found for database type: ${databaseType}${
          adapterName ? ` with name: ${adapterName}` : ""
        }`
      );
    }

    return adapter;
  }

  /**
   * Enhance query with relationship information
   */
  private enhanceQueryWithRelationships(query: IntermediateQuery): void {
    if (!this.relationshipRegistry || !query.joins) return;

    this.enhanceJoinsRecursively(query.joins, query.collection);
  }

  /**
   * Recursively enhance joins with relationship information
   */
  private enhanceJoinsRecursively(
    joins: any[],
    sourceCollection: string
  ): void {
    if (!this.relationshipRegistry) {
      throw new RelationshipError("Relationship registry is not initialized");
    }

    if (!Array.isArray(joins)) {
      throw new QueryError("Joins must be an array");
    }

    joins.forEach((join) => {
      if (join.relationship && !join.on.length) {
        // Populate join conditions from relationship registry
        const relationships =
          this.relationshipRegistry!.getRelationships(sourceCollection);
        
        if (!Array.isArray(relationships)) {
          throw new RelationshipError(`Failed to get relationships for collection: ${sourceCollection}`);
        }
        
        const relationship = relationships.find(
          (rel) => rel.name === join.relationship!.name
        );

        if (relationship) {
          join.on = [
            {
              local: relationship.localField,
              foreign: relationship.foreignField,
              operator: "eq",
            },
          ];

          // Update target to use actual target table
          join.target = relationship.targetTable;

          // Set join type based on relationship type
          if (relationship.type === "one-to-one") {
            join.type = "one-to-one";
          } else if (relationship.type === "one-to-many") {
            join.type = "one-to-many";
          } else if (relationship.type === "many-to-one") {
            join.type = "many-to-one";
          } else if (relationship.type === "many-to-many") {
            join.type = "many-to-many";
            join.relationship!.junction = relationship.junction;
          }
        }
      }

      // Recursively enhance nested joins
      if (join.joins && join.joins.length > 0) {
        this.enhanceJoinsRecursively(join.joins, join.target);
      }
    });
  }

  /**
   * Apply RBAC field restrictions
   */
  private applyRbacRestrictions(
    query: IntermediateQuery,
    collection: string,
    roles: string[]
  ): void {
    if (!query) {
      throw new QueryError("Query object is required");
    }
    
    if (!collection || typeof collection !== 'string') {
      throw new QueryError("Valid collection name is required");
    }
    
    if (!Array.isArray(roles)) {
      throw new AuthorizationError("Roles must be an array");
    }
    
    const rbacValidator = new RbacValidator();
    
    let allowedFields: string[];
    try {
      allowedFields = rbacValidator.getRbacFeatures(
        collection,
        "read",
        roles
      );
    } catch (error) {
      throw wrapError(error, 'Failed to apply RBAC restrictions');
    }

    if (allowedFields.length > 0) {
      if (!query.select) {
        query.select = { fields: [] };
      }

      if (!query.select.fields || query.select.fields.length === 0) {
        // If no specific fields requested, apply RBAC restrictions
        query.select.fields = allowedFields;
      } else {
        // Filter requested fields by RBAC permissions
        query.select.fields = query.select.fields.filter(
          (field) => allowedFields.includes(field) || field.includes("*")
        );
      }
    }
  }

  /**
   * Register a new database adapter
   */
  registerAdapter(adapter: DatabaseAdapter): void {
    this.adapterRegistry.register(adapter);
  }

  /**
   * Unregister a database adapter
   */
  unregisterAdapter(name: string, version?: string): boolean {
    return this.adapterRegistry.unregister(name, version);
  }

  /**
   * Convert query to intermediate format (for debugging/inspection)
   */
  convertToIntermediate(
    params: QueryParams,
    collection: string,
    roles: string[] = []
  ): IntermediateQuery {
    const query = this.queryConverter.convert(params, collection, roles);
    this.enhanceQueryWithRelationships(query);
    this.applyRbacRestrictions(query, collection, roles);
    return query;
  }

  /**
   * Convert intermediate query to native format (for debugging/inspection)
   */
  convertToNative(
    intermediateQuery: IntermediateQuery,
    databaseType: DatabaseType,
    adapterName?: string
  ): any {
    const adapter = this.getAdapter(databaseType, adapterName);
    return adapter.convertQuery(intermediateQuery);
  }
}

/**
 * Configuration interface for the new core
 */
export interface CoreConfig {
  /** Database adapter configurations */
  adapters?: Record<string, any>;

  /** Relationship definitions */
  relationships?: Record<string, any>;

  /** RBAC configuration */
  rbac?: any;

  /** Performance settings */
  performance?: {
    queryTimeout?: number;
    maxComplexity?: number;
    enableCache?: boolean;
  };

  /** Security settings */
  security?: {
    maxQueryDepth?: number;
    enableAuditLog?: boolean;
  };
}

/**
 * Factory function for creating a new core instance
 */
export function createCore(
  relationshipRegistry?: RelationshipRegistry,
  config?: CoreConfig
): NewCore {
  return new NewCore(relationshipRegistry);
}
