import { FilterParser } from "./filterParser";

/**
 * Handles logical operations like OR and AND
 */
export class LogicalParser {
  /**
   * Parse logical expressions like "or=(age.lt.18,age.gt.21)"
   */
  parseLogical(expression: string): any {
    if (expression.startsWith('or=')) {
      return this.parseOr(expression.substring(3));
    } else if (expression.startsWith('and=')) {
      return this.parseAnd(expression.substring(4));
    } else if (expression.startsWith('not.')) {
      return this.parseNot(expression.substring(4));
    }
    
    return null;
  }
  
  private parseOr(expression: string): Record<string, any> {
    const conditions = this.parseConditions(expression);
    return { $or: conditions };
  }
  
  private parseAnd(expression: string): Record<string, any> {
    const conditions = this.parseConditions(expression);
    return { $and: conditions };
  }
  
  private parseNot(expression: string): Record<string, any> {
    if (expression.startsWith('and=')) {
      const andCondition = this.parseAnd(expression.substring(4));
      return { $not: andCondition };
    } else if (expression.startsWith('or=')) {
      const orCondition = this.parseOr(expression.substring(3));
      return { $not: orCondition };
    }
    
    // Handle single condition negation
    const [field, operator, value] = expression.split('.');
    const filterParser = new FilterParser();
    const filter = filterParser.parseFilter(field, `${operator}.${value}`);
    const condition = filterParser.convertFilter(filter);
    
    return { $not: condition };
  }
  
  private parseConditions(expression: string): Record<string, any>[] {
    // Remove outer parentheses
    const cleaned = expression.replace(/^\(|\)$/g, '');
    
    // Split by comma but respect nested parentheses
    const conditions: string[] = [];
    let current = '';
    let depth = 0;
    
    for (const char of cleaned) {
      if (char === '(' || char === '{') depth++;
      if (char === ')' || char === '}') depth--;
      
      if (char === ',' && depth === 0) {
        conditions.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      conditions.push(current.trim());
    }
    
    const filterParser = new FilterParser();
    return conditions.map(condition => {
      const [field, ...rest] = condition.split('.');
      const expression = rest.join('.');
      const filter = filterParser.parseFilter(field, expression);
      return filterParser.convertFilter(filter);
    });
  }
}