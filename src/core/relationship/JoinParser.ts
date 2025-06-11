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

  /**
   * Parse embedding expression like "posts(id,title,comments(id,content))"
   */
  parseEmbedExpression(
    sourceTable: string,
    expression: string
  ): EmbedRequest | null {
    // Extract table name and hint
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

    // Phân loại các fields
    const fields: string[] = [];
    const filters: Record<string, string> = {};
    const functionFields: string[] = [];

    allFields.forEach((field) => {
      if (this.isFilterExpression(field)) {
        // Parse filter expression thành key-value
        const filterObj = this.parseFilterExpression(field);
        Object.assign(filters, filterObj);
      } else if (field.includes("(")) {
        // Đây là nested join
        functionFields.push(field);
      } else {
        // Đây là field thông thường
        fields.push(field);
      }
    });

    // Parse nested children
    const children = functionFields
      .map((f) => this.parseEmbedExpression(tableName, f))
      .filter((child) => child !== null) as EmbedRequest[];

    return {
      table: tableName,
      children,
      fields,
      filters, // Trả về filters riêng biệt
      joinHint: joinHint || "left",
    };
  }

  // Helper function để parse filter expression thành object
  private parseFilterExpression(field: string): Record<string, string> {
    const result: Record<string, string> = {};

    // Tách key và value từ expression
    const equalIndex = field.indexOf("=");
    if (equalIndex === -1) return result;

    const key = field.substring(0, equalIndex);
    const value = field.substring(equalIndex + 1);

    result[key] = value;

    return result;
  }
  private isFilterExpression(field: string): boolean {
    // Kiểm tra các pattern thường gặp trong filter
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

  // Enhanced splitFieldsSafely để handle complex expressions
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
          // Đây là separator ở level root
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
    filters: Record<string, any>
  ): any {
    console.log(filters);
    if (Array.isArray(lookupStage)) {
      lookupStage = lookupStage[1]; // hoặc return lookupStage;
    }
    const localField = lookupStage.$lookup.localField;
    const foreignField = lookupStage.$lookup.foreignField;
    const from = lookupStage.$lookup.from;
    const as = lookupStage.$lookup.as;

    const letVar = "local_value"; // Tên biến trong

    const result = this.buildLogicNested(filters);

    const pipeline: any[] = [
      {
        $match: {
          $and: [
            {
              $expr: {
                $eq: [`$${foreignField}`, `$$${letVar}`],
              },
            },
            { ...result.filter },
          ],
        },
      },
    ];
    console.log("pipeline", JSON.stringify(pipeline));

    // Đệ quy thêm nested $lookup từ children
    for (const child of children) {
      if (!child) continue;
      const relationship = this.registry.get(parent, child.table);

      if (!relationship) {
        throw new Error(`Relationship ${parent}.${child.table} not found`);
      }

      const lookupStage = relationship.generateLookupStage(child);
      const childLookup = this.buildLookupNested(
        lookupStage,
        child.children,
        child.table,
        {}
      );
      if (Array.isArray(lookupStage)) {
        pipeline.push(lookupStage[0]);
        pipeline.push({
          $unwind: {
            path: "$_junction",
            preserveNullAndEmptyArrays: true,
          },
        });
        pipeline.push(childLookup);
        pipeline.push(lookupStage[2]);
      }
      // Push child lookup và $addFields vào pipeline
      else {
        pipeline.push(childLookup);
      }
    }

    return {
      $lookup: {
        from,
        let: { [letVar]: `$${localField}` },
        pipeline,
        as,
      },
    };
  }

  /**
   * Generate MongoDB lookup stages for embed request
   */
  generateLookupStages(sourceTable: string, embedRequest: EmbedRequest): any[] {
    console.log(embedRequest);
    const relationship = this.registry.get(sourceTable, embedRequest.table);

    if (!relationship) {
      throw new Error(
        `Relationship ${sourceTable}.${embedRequest.table} not found`
      );
    }

    const lookupStage = relationship.generateLookupStage(embedRequest);
    const stages = [];
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
    if (embedRequest.joinHint === "inner") {
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
