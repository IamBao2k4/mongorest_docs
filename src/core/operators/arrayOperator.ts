import { BaseOperator } from "./baseOperator";

export class InOperator extends BaseOperator {
  readonly name = 'in';
  
  convert(field: string, value: any): Record<string, any> {
    const values = this.parseArray(value);
    return { [field]: { $in: values } };
  }
}

export class ContainsOperator extends BaseOperator {
  readonly name = 'cs';
  
  convert(field: string, value: any): Record<string, any> {
    const values = this.parseArray(value);
    return { [field]: { $all: values } };
  }
}

export class ContainedInOperator extends BaseOperator {
  readonly name = 'cd';
  
  convert(field: string, value: any): Record<string, any> {
    const values = this.parseArray(value);
    return { [field]: { $in: values } };
  }
}

export class OverlapOperator extends BaseOperator {
  readonly name = 'ov';
  
  convert(field: string, value: any): Record<string, any> {
    const values = this.parseArray(value);
    return { [field]: { $elemMatch: { $in: values } } };
  }
}