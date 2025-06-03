/**
 * Base class for all PostgREST operators
 */
export abstract class BaseOperator {
  abstract readonly name: string;
  abstract convert(field: string, value: any): Record<string, any>;
  
  protected parseValue(value: string): any {
    // Handle null values
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) return num;
    
    return value;
  }
  
  protected parseArray(value: string): any[] {
    // Handle array format: (1,2,3) or {1,2,3}
    const cleaned = value.replace(/^[({]|[})]$/g, '');
    return cleaned.split(',').map(v => this.parseValue(v.trim()));
  }
}