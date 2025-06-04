import { JoinParser } from "../relationship/JoinParser";
import { RelationshipRegistry } from "../relationship/RelationshipRegistry";
import { RelationshipDefinition } from "../relationship/types";

export class ModularSelectParser {
  private registry: RelationshipRegistry;
  private joinParser: JoinParser;
  private maxEmbedDepth: number;
  private currentDepth: number = 0;

  constructor(registry: RelationshipRegistry, maxEmbedDepth: number = 3) {
    this.registry = registry;
    this.joinParser = new JoinParser(registry);
    this.maxEmbedDepth = maxEmbedDepth;
  }

  /**
   * Parse select expression with embeds
   */
  parseSelect(
    sourceTable: string,
    selectClause: string
  ): {
    fields: Record<string, 1>;
    pipeline: any[];
    embeds: string[];
  } {
    if (!selectClause || selectClause === "*") {
      return { fields: {}, pipeline: [], embeds: [] };
    }

    this.currentDepth = 0;
    const result = {
      fields: {} as Record<string, 1>,
      pipeline: [] as any[],
      embeds: [] as string[],
    };
    console.log(selectClause)
    const tokens = this.tokenizeSelect(selectClause);
    console.log(tokens)
    for (const token of tokens) {
      if (this.isEmbedExpression(token)) {
        if (this.currentDepth < this.maxEmbedDepth) {
          const embedRequest = this.joinParser.parseEmbedExpression(
            sourceTable,
            token
          );
          if (embedRequest) {
            const stages = this.joinParser.generateLookupStages(
              sourceTable,
              embedRequest
            );
            result.pipeline.push(...stages);
            result.embeds.push(embedRequest.table);
          }
        }
      } else {
        // Regular field
        const field = this.parseRegularField(token);
        if (field) {
          Object.assign(result.fields, field);
        }
      }
    }

    return result;
  }

  private tokenizeSelect(expression: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let depth = 0;
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      // ✅ Fix: Handle quotes properly
      if ((char === '"' || char === "'") && expression[i - 1] !== "\\") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = "";
        }
        current += char;
      } else if (!inQuotes) {
        if (char === "(") {
          depth++;
          current += char;
        } else if (char === ")") {
          depth--;
          current += char;
        } else if (char === "," && depth === 0) {
          if (current.trim()) {
            tokens.push(current.trim());
          }
          current = "";
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  private isEmbedExpression(token: string): boolean {
  const trimmed = token.trim();
  
  // Must have both opening and closing parentheses
  if (!trimmed.includes('(') || !trimmed.includes(')')) {
    return false;
  }
  
  // Must not be a quoted string
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return false;
  }
  
  // Check for proper parentheses pairing
  let openCount = 0;
  let closeCount = 0;
  let lastClosePos = -1;
  
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') openCount++;
    if (trimmed[i] === ')') {
      closeCount++;
      lastClosePos = i;
    }
  }
  
  // Must have equal open/close and close at the end
  return openCount === closeCount && 
         openCount > 0 && 
         lastClosePos === trimmed.length - 1;
}

  private parseRegularField(token: string): Record<string, 1> | null {
  let trimmed = token.trim();
  
  if (!trimmed || trimmed === '*') {
    return {};
  }

  // Handle alias format: "alias:field_name"
  if (trimmed.includes(':') && !trimmed.includes('::')) {
    const [alias, fieldName] = trimmed.split(':');
    const cleanFieldName = fieldName ? fieldName.trim() : '';
    if (cleanFieldName) {
      return { [cleanFieldName]: 1 };
    }
  }

  // Handle JSON path like "json_data->field" (simplified)
  if (trimmed.includes('->')) {
    const cleanField = trimmed.split('->')[0];
    if (cleanField) {
      return { [cleanField]: 1 };
    }
  }

  // ✅ IMPROVED: Handle casting like "price::text"
  if (trimmed.includes('::')) {
    const parts = trimmed.split('::');
    const fieldName = parts[0];
    if (fieldName && fieldName.trim()) {
      return { [fieldName.trim()]: 1 };
    }
    // If no field name before ::, skip this token
    return null;
  }

  // Regular field
  return { [trimmed]: 1 };
}
}

// Configuration helpers
export const createRelationshipConfig = (
  definitions: Record<string, RelationshipDefinition[]>
): RelationshipRegistry => {
  const registry = new RelationshipRegistry();
  registry.registerBulk(definitions);
  return registry;
};

// Example configuration
export const SAMPLE_RELATIONSHIPS: Record<string, RelationshipDefinition[]> = {
  // Users table relationships
  users: [
    {
      name: "profile",
      targetTable: "user_profiles",
      localField: "_id",
      foreignField: "user_id",
      type: "one-to-one",
    },
    {
      name: "posts",
      targetTable: "posts",
      localField: "_id",
      foreignField: "author_id",
      type: "one-to-many",
    },
    {
      name: "orders",
      targetTable: "orders",
      localField: "_id",
      foreignField: "customerId",
      type: "one-to-many",
    },
    {
      name: "reviews",
      targetTable: "product_reviews",
      localField: "_id",
      foreignField: "userId",
      type: "one-to-many",
    },
  ],

  // Orders table relationships
  orders: [
    {
      name: "customer",
      targetTable: "users",
      localField: "customerId",
      foreignField: "_id",
      type: "many-to-one",
    },
    {
      name: "items",
      targetTable: "order_items",
      localField: "_id",
      foreignField: "order_id",
      type: "one-to-many",
    },
  ],

  // Products table relationships
  products: [
    {
      name: "reviews",
      targetTable: "product_reviews",
      localField: "_id",
      foreignField: "productId",
      type: "one-to-many",
    },
    {
      name: "categories",
      targetTable: "categories",
      localField: "_id",
      foreignField: "_id",
      type: "many-to-many",
      junction: {
        table: "product_categories",
        localKey: "productId",
        foreignKey: "categoryId",
      },
    },
  ],

  // Categories table relationships
  categories: [
    {
      name: "parent",
      targetTable: "categories",
      localField: "parentId",
      foreignField: "_id",
      type: "many-to-one",
    },
    {
      name: "children",
      targetTable: "categories",
      localField: "_id",
      foreignField: "parentId",
      type: "one-to-many",
    },
    {
      name: "products",
      targetTable: "products",
      localField: "_id",
      foreignField: "_id",
      type: "many-to-many",
      junction: {
        table: "product_categories",
        localKey: "categoryId",
        foreignKey: "productId",
      },
    },
  ],

  // Product Reviews relationships
  product_reviews: [
    {
      name: "product",
      targetTable: "products",
      localField: "productId",
      foreignField: "_id",
      type: "many-to-one",
    },
    {
      name: "user",
      targetTable: "users",
      localField: "userId",
      foreignField: "_id",
      type: "many-to-one",
    },
  ],
};

export { RelationshipRegistry, JoinParser };
