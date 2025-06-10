import { table } from "console";
import { RelationshipRegistry } from "./RelationshipRegistry";
import { EmbedRequest, RelationshipDefinition } from "./types";
import { cpSync } from "fs";
import { isArray } from "class-validator";

/**
 * Parser for join/embedding expressions
 */
export class JoinParser {
  private registry: RelationshipRegistry;

  constructor(registry: RelationshipRegistry) {
    this.registry = registry;
  }

  splitFieldsSafely(input: string): string[] {
    const result: string[] = [];
    let current = "";
    let depth = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      }

      if (char === "," && depth === 0) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      result.push(current.trim());
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
    const fields = allFields.filter((f) => !f.includes("("));
    const functionFields = allFields.filter((f) => f.includes("("));

    const children = functionFields
      .map((f) => this.parseEmbedExpression(tableName, f))
      .filter((child) => child !== null) as EmbedRequest[];

    return {
      table: tableName,
      children,
      fields,
      joinHint: joinHint || "left",
    };
  }

  /**
   * Build Advance
   */
  buildLookupNested(
    lookupStage: any,
    children: (EmbedRequest | null)[] = [],
    parent: string
  ): any {
    if (Array.isArray(lookupStage)) {
      console.log("lookupStage", lookupStage);
      lookupStage = lookupStage[1]; // hoặc return lookupStage;
    }
    const localField = lookupStage.$lookup.localField;
    const foreignField = lookupStage.$lookup.foreignField;
    const from = lookupStage.$lookup.from;
    const as = lookupStage.$lookup.as;

    const letVar = "local_value"; // Tên biến trong $let
    const pipeline: any[] = [
      {
        $match: {
          $expr: {
            $eq: [`$${foreignField}`, `$$${letVar}`],
          },
        },
      },
    ];

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
        child.table
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
    console.log(sourceTable, embedRequest);
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
          embedRequest.table
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
