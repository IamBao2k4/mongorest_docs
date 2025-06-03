import { MongoQuery, QueryParams } from "..";
import { FilterParser } from "../parsers/filterParser";
import { LogicalParser } from "../parsers/logicalParser";
import { OrderParser } from "../parsers/orderParser";
import { SelectParser } from "../parsers/selectParser";

/**
 * Main converter class that coordinates all parsers
 */
export class PostgRESTToMongoConverter {
  private filterParser: FilterParser;
  private logicalParser: LogicalParser;
  private selectParser: SelectParser;
  private orderParser: OrderParser;
  
  constructor() {
    this.filterParser = new FilterParser();
    this.logicalParser = new LogicalParser();
    this.selectParser = new SelectParser();
    this.orderParser = new OrderParser();
  }
  
  /**
   * Convert PostgREST query parameters to MongoDB query
   */
  convert(params: QueryParams): MongoQuery {
    const result: MongoQuery = {
      filter: {}
    };
    
    const filterConditions: Record<string, any>[] = [];
    
    Object.entries(params).forEach(([key, value]) => {
      const paramValue = Array.isArray(value) ? value[0] : value;
      
      // Handle special parameters
      if (key === 'select') {
        result.projection = this.selectParser.parseSelect(paramValue);
        return;
      }
      
      if (key === 'order') {
        result.sort = this.orderParser.parseOrder(paramValue);
        return;
      }
      
      // Handle logical operations
      if (key === 'or' || key === 'and' || key.startsWith('not.')) {
        const logicalCondition = this.logicalParser.parseLogical(`${key}=${paramValue}`);
        if (logicalCondition) {
          filterConditions.push(logicalCondition);
          return;
        }
      }
      
      // Handle regular filters
      const filter = this.filterParser.parseFilter(key, paramValue);
      const mongoFilter = this.filterParser.convertFilter(filter);
      filterConditions.push(mongoFilter);
    });
    
    // Combine all filter conditions
    if (filterConditions.length === 1) {
      result.filter = filterConditions[0];
    } else if (filterConditions.length > 1) {
      result.filter = { $and: filterConditions };
    }
    
    return result;
  }
}
