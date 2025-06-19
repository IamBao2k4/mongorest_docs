// 🔧 STEP 1: Fix Your Current PostgRESTToMongoConverter.ts

import { MongoQuery, QueryParams } from "..";
import { FilterParser } from "../parsers/filterParser";
import { LogicalParser } from "../parsers/logicalParser";
import { OrderParser } from "../parsers/orderParser";
import { ModularSelectParser, RelationshipRegistry } from "../parsers/selectParser";
import { RbacValidator } from "../rbac/rbac-validator";
import { Core } from "./mainCore";

/**
 * Fixed version of your converter - minimal changes
 */
export class MongoRest{
  private filterParser: FilterParser;
  private logicalParser: LogicalParser;
  private selectParser: ModularSelectParser; // ✅ Fixed naming
  private orderParser: OrderParser;

  constructor(registry?: RelationshipRegistry) {
    this.filterParser = new FilterParser();
    this.logicalParser = new LogicalParser();
    this.selectParser = new ModularSelectParser(registry || new RelationshipRegistry()); // ✅ Fixed constructor
    this.orderParser = new OrderParser();
  }

  /**
   * Convert PostgREST query parameters to MongoDB query
   */
  convert(params: QueryParams, collection: string, roles: string[]): MongoQuery {
    
    console.log("params", JSON.stringify(params))

    const result: MongoQuery = {
      filter: {},
      projection: {},
    };

    const filterConditions: Record<string, any>[] = [];

    Object.entries(params).forEach(([key, value]) => {
      const paramValue = Array.isArray(value) ? value[0] : value;

      // ✅ Handle special parameters
      if (key === 'select') {
        this.handleSelect(paramValue, collection, result);
        return;
      }

      if (key === 'order') {
        result.sort = this.orderParser.parseOrder(paramValue);
        return;
      }

      // ✅ Handle pagination parameters
      if (key === 'limit') {
        result.limit = parseInt(paramValue);
        return;
      }

      if (key === 'skip') {
        result.skip = parseInt(paramValue);
        return;
      }

      if (key === 'count') {
        result.count = paramValue === 'true' || paramValue === 'exact';
        return;
      }

      // ✅ Handle logical operations
      if (key === 'or' || key === 'and' || key.startsWith('not.')) {
        const logicalCondition = this.logicalParser.parseLogical(`${key}=${paramValue}`);
        if (logicalCondition) {
          filterConditions.push(logicalCondition);
          return;
        }
      }

      // ✅ Regular filters
      const filter = this.filterParser.parseFilter(key, paramValue);
      const mongoFilter = this.filterParser.convertFilter(filter);
      filterConditions.push(mongoFilter);
    });

    // ✅ Combine all filter conditions
    if (filterConditions.length === 1) {
      result.filter = filterConditions[0];
    } else if (filterConditions.length > 1) {
      result.filter = { $and: filterConditions };
    }

    RbacValidator.getRbacFeatures(
      collection,
      'read',
      roles,
    ).forEach((f : string) => {
      result.projection![f] = 1;
    })
        return result;
  }


  // ✅ New helper method
  private handleSelect(selectValue: string, collection: string | undefined, result: MongoQuery): void {
    if (!selectValue || selectValue === '*') {
      return;
    }
    if (collection) {
      // Use enhanced parsing with embeds
      const selectResult = this.selectParser.parseSelect(collection, selectValue);
      result.projection = selectResult.fields;
      if (selectResult.pipeline.length > 0) {
        result.pipeline = selectResult.pipeline;
        result.hasEmbeds = true;
        result.embeddedTables = selectResult.embeds;
      }
    } else {
      // Fallback to simple parsing
      result.projection = this.parseSimpleSelect(selectValue);
    }
  }

  // ✅ Fallback method for backward compatibility
  private parseSimpleSelect(selectClause: string): Record<string, 1> {
    const projection: Record<string, 1> = {};
    const fields = selectClause.split(',');

    fields.forEach(field => {
      const trimmed = field.trim();

      if (trimmed.includes(':')) {
        const [alias, fieldName] = trimmed.split(':');
        projection[fieldName.trim()] = 1;
      } else {
        const cleanField = trimmed.replace(/->>?.*$/, '');
        projection[cleanField] = 1;
      }
    });
    return projection;
  }
}