import { BaseOperator } from "./baseOperator";

export class LikeOperator extends BaseOperator {
  readonly name = 'like';
  
  convert(field: string, value: any): Record<string, any> {
    // Convert PostgREST LIKE pattern to MongoDB regex
    // Replace * with .* for wildcard matching
    const pattern = value.toString().replace(/\*/g, '.*');
    return { [field]: { $regex: pattern, $options: 'i' } };
  }
}

export class ILikeOperator extends BaseOperator {
  readonly name = 'ilike';
  
  convert(field: string, value: any): Record<string, any> {
    const pattern = value.toString().replace(/\*/g, '.*');
    return { [field]: { $regex: pattern, $options: 'i' } };
  }
}

export class MatchOperator extends BaseOperator {
  readonly name = 'match';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $regex: value.toString() } };
  }
}

export class IMatchOperator extends BaseOperator {
  readonly name = 'imatch';
  
  convert(field: string, value: any): Record<string, any> {
    return { [field]: { $regex: value.toString(), $options: 'i' } };
  }
}
