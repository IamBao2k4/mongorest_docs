import { BaseOperator } from "./baseOperator";

export class NotOperator extends BaseOperator {
  readonly name = 'not';
  
  convert(field: string, value: any, innerOperator?: BaseOperator): Record<string, any> {
    if (!innerOperator) {
      throw new Error('Not operator requires an inner operator');
    }
    
    const innerQuery = innerOperator.convert(field, value);
    return { $not: innerQuery };
  }
}
