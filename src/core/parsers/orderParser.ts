/**
 * Handles ORDER BY clause parsing
 */
export class OrderParser {
  /**
   * Parse order parameter like "age.desc,height.asc" or "age"
   */
  parseOrder(orderClause: string): Record<string, 1 | -1> {
    if (!orderClause) {
      return {};
    }
    
    const sort: Record<string, 1 | -1> = {};
    const fields = orderClause.split(',');
    
    fields.forEach(field => {
      const trimmed = field.trim();
      const parts = trimmed.split('.');
      
      const fieldName = parts[0];
      const direction = parts[1];
      
      // Handle nulls directives (nullsfirst, nullslast) - MongoDB doesn't have direct equivalent
      const isDesc = direction === 'desc';
      sort[fieldName] = isDesc ? -1 : 1;
    });
    
    return sort;
  }
}