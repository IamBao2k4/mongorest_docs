import { ParsedFilter } from "..";
import { ContainedInOperator, ContainsOperator, InOperator, OverlapOperator } from "../operators/arrayOperators";
import { BaseOperator } from "../operators/baseOperator";
import { EqualOperator, GreaterThanEqualOperator, GreaterThanOperator, LessThanEqualOperator, LessThanOperator, NotEqualOperator } from "../operators/comparisonOperators";
import { IsDistinctOperator, IsOperator } from "../operators/nullOperators";
import { ILikeOperator, IMatchOperator, LikeOperator, MatchOperator } from "../operators/textOperators";

/**
 * Parses PostgREST filter expressions into structured format
 */
export class FilterParser {
  private operators: Map<string, BaseOperator>;
  
  constructor() {
    this.operators = new Map();
    this.registerOperators();
  }
  
  private registerOperators(): void {
    const operatorClasses = [
      EqualOperator,
      NotEqualOperator,
      GreaterThanOperator,
      GreaterThanEqualOperator,
      LessThanOperator,
      LessThanEqualOperator,
      LikeOperator,
      ILikeOperator,
      MatchOperator,
      IMatchOperator,
      InOperator,
      ContainsOperator,
      ContainedInOperator,
      OverlapOperator,
      IsOperator,
      IsDistinctOperator
    ];
    
    operatorClasses.forEach(OperatorClass => {
      const operator = new OperatorClass();
      this.operators.set(operator.name, operator);
    });
  }
  
  /**
   * Parse a filter expression like "age=lt.13" or "name=eq.John"
   */
  parseFilter(field: string, expression: string): ParsedFilter {
    const parts = expression.split('.');
    
    if (parts.length < 2) {
      // Default to equals if no operator specified
      return {
        field,
        operator: 'eq',
        value: expression
      };
    }
    
    const [operator, ...valueParts] = parts;
    const value = valueParts.join('.');
    
    // Handle modifiers like like(any) or like(all)
    const modifierMatch = operator.match(/^(\w+)\((\w+)\)$/);
    if (modifierMatch) {
      return {
        field,
        operator: modifierMatch[1],
        value,
        modifier: modifierMatch[2]
      };
    }
    
    return {
      field,
      operator,
      value
    };
  }
  
  /**
   * Convert parsed filter to MongoDB query
   */
  convertFilter(filter: ParsedFilter): Record<string, any> {
    const operator = this.operators.get(filter.operator);
    
    if (!operator) {
      throw new Error(`Unknown operator: ${filter.operator}`);
    }
    
    // Handle modifiers (any/all)
    if (filter.modifier) {
      return this.handleModifier(filter, operator);
    }
    
    return operator.convert(filter.field, filter.value);
  }
  
  private handleModifier(filter: ParsedFilter, operator: BaseOperator): Record<string, any> {
    const { field, value, modifier } = filter;
    const values = operator['parseArray'] ? operator['parseArray'](value) : [value];
    
    if (modifier === 'any') {
      // Convert to $or condition
      const conditions = values.map(v => operator.convert(field, v));
      return { $or: conditions };
    } else if (modifier === 'all') {
      // Convert to $and condition
      const conditions = values.map(v => operator.convert(field, v));
      return { $and: conditions };
    }
    
    return operator.convert(field, value);
  }
}
