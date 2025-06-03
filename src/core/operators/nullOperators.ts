import { BaseOperator } from "./baseOperator";

export class IsOperator extends BaseOperator {
  readonly name = 'is';
  
  convert(field: string, value: any): Record<string, any> {
    switch (value) {
      case 'null':
        return { [field]: null };
      case 'not_null':
        return { [field]: { $ne: null } };
      case 'true':
        return { [field]: true };
      case 'false':
        return { [field]: false };
      default:
        return { [field]: value };
    }
  }
}

export class IsDistinctOperator extends BaseOperator {
  readonly name = 'isdistinct';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $ne: this.parseValue(value) } };
  }
}