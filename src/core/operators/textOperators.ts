import { BaseOperator } from './baseOperator';

// Escape regex special characters, trừ dấu * (vì sẽ thay riêng)
function escapeRegexExceptAsterisk(value: string): string {
  return value.replace(/[-[\]{}()+?.\\^$|#\s]/g, '\\$&');
}

export class LikeOperator extends BaseOperator {
  readonly name = 'like';

  convert(field: string, value: any): Record<string, any> {
    const escaped = escapeRegexExceptAsterisk(value.toString());
    const pattern = escaped.replace(/\*/g, '.*');
    return { [field]: { $regex: pattern, $options: 'i' } };
  }
}

export class ILikeOperator extends BaseOperator {
  readonly name = 'ilike';

  convert(field: string, value: any): Record<string, any> {
    const escaped = escapeRegexExceptAsterisk(value.toString());
    const pattern = escaped.replace(/\*/g, '.*');
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
