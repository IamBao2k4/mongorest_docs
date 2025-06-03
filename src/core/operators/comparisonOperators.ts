import { BaseOperator } from "./baseOperator";

export class EqualOperator extends BaseOperator {
  readonly name = 'eq';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: this.parseValue(value) };
  }
}

export class NotEqualOperator extends BaseOperator {
  readonly name = 'neq';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $ne: this.parseValue(value) } };
  }
}

export class GreaterThanOperator extends BaseOperator {
  readonly name = 'gt';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $gt: this.parseValue(value) } };
  }
}

export class GreaterThanEqualOperator extends BaseOperator {
  readonly name = 'gte';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $gte: this.parseValue(value) } };
  }
}

export class LessThanOperator extends BaseOperator {
  readonly name = 'lt';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $lt: this.parseValue(value) } };
  }
}

export class LessThanEqualOperator extends BaseOperator {
  readonly name = 'lte';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $lte: this.parseValue(value) } };
  }
}
