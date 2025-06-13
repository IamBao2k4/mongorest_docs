import { table } from "console";
import { RelationshipRegistry } from "./RelationshipRegistry";
import { EmbedRequest, RelationshipDefinition } from "./types";
import { cpSync } from "fs";
import { isArray } from "class-validator";
import { MongoQuery, QueryParams } from "..";
import { LogicalParser } from "../parsers/logicalParser";
import { FilterParser } from "../parsers/filterParser";

/**
 * Parser for join/embedding expressions
 */
export class JoinParser {
  private registry: RelationshipRegistry;
  private logicalParser: LogicalParser;
  private filterParser: FilterParser;
  constructor(registry: RelationshipRegistry) {
    this.registry = registry;
    this.logicalParser = new LogicalParser();
    this.filterParser = new FilterParser();
  }

  buildLogicNested(params: QueryParams) {
    const result: MongoQuery = {
      filter: {},
    };
    const filterConditions: Record<string, any>[] = [];
    Object.entries(params).forEach(([key, value]) => {
      const paramValue = Array.isArray(value) ? value[0] : value;
      if (key === "or" || key === "and" || key.startsWith("not.")) {
        const logicalCondition = this.logicalParser.parseLogical(
          `${key}=${paramValue}`
        );
        if (logicalCondition) {
          filterConditions.push(logicalCondition);
          return;
        }
      }
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

    return result;
  }

  parseEmbedExpression(
    sourceTable: string,
    expression: string
  ): EmbedRequest | null {
    // Extract table name and content in parentheses
    const match = expression.match(/^([^!(]+)(!([^(]+))?(\(.*\))?(.*)$/);
    if (!match) return null;

    const tableName = match[1].trim();
    const joinHint = match[3];
    const fieldsContent = match[4] ? match[4].slice(1, -1) : ""; // Remove outer parentheses

    // Check if relationship exists
    if (!this.registry.has(sourceTable, tableName)) {
      console.warn(
        `Relationship ${sourceTable}.${tableName} not found in registry`
      );
      return null;
    }

    // Split and classify fields
    const allFields = this.splitFieldsSafely(fieldsContent);

    // Classify fields
    const fields: string[] = [];
    const filters: Record<string, string> = {};
    const nestedJoins: string[] = [];

    allFields.forEach((field) => {
      if (this.isFilterExpression(field)) {
        // Parse filter expression
        const filterObj = this.parseFilterExpression(field);
        Object.assign(filters, filterObj);
      } else if (this.isNestedJoin(field)) {
        // This is a nested join (contains table name with parentheses)
        nestedJoins.push(field);
      } else {
        // Regular field
        fields.push(field);
      }
    });

    // Parse nested children
    const children = nestedJoins
      .map((f) => this.parseEmbedExpression(tableName, f))
      .filter((child) => child !== null) as EmbedRequest[];

    return {
      table: tableName,
      children,
      fields,
      filters,
      joinHint: joinHint || "left",
    };
  }

  // Helper function to parse filter expression into object
  private parseFilterExpression(field: string): Record<string, string> {
    const result: Record<string, string> = {};

    // Handle special cases like "or=" and "and="
    if (field.startsWith("or=") || field.startsWith("and=")) {
      const key = field.substring(0, field.indexOf("="));
      const value = field.substring(field.indexOf("=") + 1);
      result[key] = value;
      return result;
    }

    // Handle regular filter expressions
    const equalIndex = field.indexOf("=");
    if (equalIndex === -1) return result;

    const key = field.substring(0, equalIndex);
    const value = field.substring(equalIndex + 1);
    result[key] = value;

    return result;
  }

  private isFilterExpression(field: string): boolean {
    // First check if it's a nested join (has parentheses)
    // If it has parentheses, it's likely a nested join, not a filter
    if (field.includes("(") && field.includes(")")) {
      // Check if it starts with known filter prefixes when it has parentheses
      return /^(or|and)=/.test(field);
    }

    // Check for filter patterns for non-parentheses expressions
    const filterPatterns = [
      /=eq\./, // equal
      /=neq\./, // not equal
      /=gt\./, // greater than
      /=gte\./, // greater than or equal
      /=lt\./, // less than
      /=lte\./, // less than or equal
      /=like\./, // like
      /=ilike\./, // case insensitive like
      /=in\./, // in
      /=is\./, // is (null, not null)
      /^or=/, // or condition
      /^and=/, // and condition
    ];

    return filterPatterns.some((pattern) => pattern.test(field));
  }

  // New helper function to identify nested joins
  private isNestedJoin(field: string): boolean {
    // A nested join should contain parentheses and not be a filter expression
    return (
      field.includes("(") &&
      field.includes(")") &&
      !this.isFilterExpression(field)
    );
  }

  // Enhanced splitFieldsSafely to handle complex expressions
  private splitFieldsSafely(content: string): string[] {
    if (!content) return [];

    const fields: string[] = [];
    let current = "";
    let depth = 0;
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : "";

      // Handle quotes
      if ((char === '"' || char === "'") && prevChar !== "\\") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = "";
        }
      }

      if (!inQuotes) {
        if (char === "(") {
          depth++;
        } else if (char === ")") {
          depth--;
        } else if (char === "," && depth === 0) {
          // This is a separator at root level
          if (current.trim()) {
            fields.push(current.trim());
          }
          current = "";
          continue;
        }
      }

      current += char;
    }

    // Add the last field
    if (current.trim()) {
      fields.push(current.trim());
    }

    return fields;
  }
  /**
   * Build Advance
   */
  buildLookupNested(
  lookupStage: any,
  children: (EmbedRequest | null)[] = [],
  parent: string,
  filters: Record<string, any>,
  isMultiResult: boolean = false
): any {
  // Lưu trạng thái ban đầu của lookupStage
  const isLookupStageArray = Array.isArray(lookupStage);
  const currentLookupStage = isLookupStageArray ? lookupStage[1] : lookupStage;
  
  const localField = currentLookupStage.$lookup.localField;
  const foreignField = currentLookupStage.$lookup.foreignField;
  const from = currentLookupStage.$lookup.from;
  const as = currentLookupStage.$lookup.as;
  const letVar = "local_value";
  
  console.log("aaaaaaaaaaaaaaaaaa",filters)
  const result = this.buildLogicNested(filters);
  
  const pipeline: any[] = [
    {
      $match: {
        $and: [
          {
            $expr: isMultiResult 
              ? {
                  $in: [`$${foreignField}`, {
                    $cond: {
                      if: { $isArray: `$$${letVar}` },
                      then: `$$${letVar}`,
                      else: [`$$${letVar}`]
                    }
                  }]
                }
              : {
                  $eq: [`$${foreignField}`, `$$${letVar}`]
                }
          },
          { ...result.filter }
        ]
      }
    }
  ];

  // Đệ quy thêm nested $lookup từ children
  for (const child of children) {
    if (!child) continue;
    
    const relationship = this.registry.get(parent, child.table);
    if (!relationship) {
      throw new Error(`Relationship ${parent}.${child.table} not found`);
    }
    
    console.log("isMultiResult", relationship.isMultiResult());
    
    // Đổi tên biến để tránh shadow
    const childLookupStage = relationship.generateLookupStage(child);
    const childLookup = this.buildLookupNested(
      childLookupStage,
      child.children,
      child.table,
      child.filters || {},
      relationship.isMultiResult()
    );

    // Xử lý lookup stage dựa trên type
    if (Array.isArray(childLookupStage)) {
      pipeline.push(childLookupStage[0]);
      pipeline.push(childLookup);
      pipeline.push(childLookupStage[2]);
    } else {
      pipeline.push(childLookup);
    }

    // Thêm $unwind nếu không phải multi result
    if (!relationship.isMultiResult()) {
      pipeline.push({
        $unwind: {
          path: `$${child.table}`,
          preserveNullAndEmptyArrays: true
        }
      });
    }
  }

  return {
    $lookup: {
      from,
      let: { [letVar]: `$${localField}` },
      pipeline,
      as
    }
  };
}

  /**
   * Generate MongoDB lookup stages for embed request
   */
  generateLookupStages(sourceTable: string, embedRequest: EmbedRequest): any[] {
    console.log("embedRequest", JSON.stringify(embedRequest));
    const relationship = this.registry.get(sourceTable, embedRequest.table);

    if (!relationship) {
      throw new Error(
        `Relationship ${sourceTable}.${embedRequest.table} not found`
      );
    }

    const lookupStage = relationship.generateLookupStage(embedRequest);
    const stages = [];
    console.log("embedRequest", JSON.stringify(embedRequest))
    if (embedRequest.children && embedRequest.children.length > 0) {
      stages.push(
        this.buildLookupNested(
          lookupStage,
          embedRequest.children,
          embedRequest.table,
          embedRequest.filters || {}
        )
      );
    } else {
      Array.isArray(lookupStage)
        ? stages.push(...lookupStage)
        : stages.push(lookupStage);
    }
    if (!relationship.isMultiResult() && embedRequest.joinHint === "inner") {
      stages.push({
        $unwind: {
          path: `$${embedRequest.alias || embedRequest.table}`,
          preserveNullAndEmptyArrays: false,
        },
      });
    }

    // Add unwind stage for many-to-one relationships if needed

    return stages;
  }
}
