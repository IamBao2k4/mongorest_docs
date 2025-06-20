import { 
  EqualOperator, 
  NotEqualOperator, 
  GreaterThanOperator, 
  GreaterThanEqualOperator, 
  LessThanOperator, 
  LessThanEqualOperator 
} from '../base/mongodb/operators/comparisonOperators';

import { 
  InOperator, 
  ContainsOperator, 
  ContainedInOperator, 
  OverlapOperator 
} from '../base/mongodb/operators/arrayOperator';

import { 
  IsOperator, 
  IsDistinctOperator 
} from '../base/mongodb/operators/nullOperators';

import { 
  LikeOperator, 
  ILikeOperator, 
  MatchOperator, 
  IMatchOperator 
} from '../base/mongodb/operators/textOperators';

import { NotOperator } from '../base/mongodb/operators/logicalOperators';

describe('Comparison Operators', () => {
  describe('EqualOperator', () => {
    let operator: EqualOperator;
    
    beforeEach(() => {
      operator = new EqualOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('eq');
    });

    test('should convert string value', () => {
      const result = operator.convert('name', 'John');
      expect(result).toEqual({ name: 'John' });
    });

    test('should convert number value', () => {
      const result = operator.convert('age', '25');
      expect(result).toEqual({ age: 25 });
    });

    test('should convert boolean value', () => {
      const result = operator.convert('active', 'true');
      expect(result).toEqual({ active: true });
    });

    test('should convert null value', () => {
      const result = operator.convert('value', 'null');
      expect(result).toEqual({ value: null });
    });
  });

  describe('NotEqualOperator', () => {
    let operator: NotEqualOperator;
    
    beforeEach(() => {
      operator = new NotEqualOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('neq');
    });

    test('should convert to $ne operator', () => {
      const result = operator.convert('status', 'inactive');
      expect(result).toEqual({ status: { $ne: 'inactive' } });
    });
  });

  describe('GreaterThanOperator', () => {
    let operator: GreaterThanOperator;
    
    beforeEach(() => {
      operator = new GreaterThanOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('gt');
    });

    test('should convert to $gt operator', () => {
      const result = operator.convert('age', '18');
      expect(result).toEqual({ age: { $gt: 18 } });
    });
  });

  describe('GreaterThanEqualOperator', () => {
    let operator: GreaterThanEqualOperator;
    
    beforeEach(() => {
      operator = new GreaterThanEqualOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('gte');
    });

    test('should convert to $gte operator', () => {
      const result = operator.convert('score', '90');
      expect(result).toEqual({ score: { $gte: 90 } });
    });
  });

  describe('LessThanOperator', () => {
    let operator: LessThanOperator;
    
    beforeEach(() => {
      operator = new LessThanOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('lt');
    });

    test('should convert to $lt operator', () => {
      const result = operator.convert('price', '100');
      expect(result).toEqual({ price: { $lt: 100 } });
    });
  });

  describe('LessThanEqualOperator', () => {
    let operator: LessThanEqualOperator;
    
    beforeEach(() => {
      operator = new LessThanEqualOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('lte');
    });

    test('should convert to $lte operator', () => {
      const result = operator.convert('budget', '1000');
      expect(result).toEqual({ budget: { $lte: 1000 } });
    });
  });
});

describe('Array Operators', () => {
  describe('InOperator', () => {
    let operator: InOperator;
    
    beforeEach(() => {
      operator = new InOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('in');
    });

    test('should convert array with parentheses', () => {
      const result = operator.convert('status', '(active,inactive,pending)');
      expect(result).toEqual({ status: { $in: ['active', 'inactive', 'pending'] } });
    });

    test('should convert array with curly braces', () => {
      const result = operator.convert('id', '{1,2,3}');
      expect(result).toEqual({ id: { $in: [1, 2, 3] } });
    });

    test('should handle mixed types in array', () => {
      const result = operator.convert('values', '(1,true,null,test)');
      expect(result).toEqual({ values: { $in: [1, true, null, 'test'] } });
    });
  });

  describe('ContainsOperator', () => {
    let operator: ContainsOperator;
    
    beforeEach(() => {
      operator = new ContainsOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('cs');
    });

    test('should convert to $all operator', () => {
      const result = operator.convert('tags', '(red,blue)');
      expect(result).toEqual({ tags: { $all: ['red', 'blue'] } });
    });
  });

  describe('ContainedInOperator', () => {
    let operator: ContainedInOperator;
    
    beforeEach(() => {
      operator = new ContainedInOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('cd');
    });

    test('should convert to $in operator', () => {
      const result = operator.convert('category', '(electronics,books)');
      expect(result).toEqual({ category: { $in: ['electronics', 'books'] } });
    });
  });

  describe('OverlapOperator', () => {
    let operator: OverlapOperator;
    
    beforeEach(() => {
      operator = new OverlapOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('ov');
    });

    test('should convert to $elemMatch operator', () => {
      const result = operator.convert('interests', '(music,sports)');
      expect(result).toEqual({ interests: { $elemMatch: { $in: ['music', 'sports'] } } });
    });
  });
});

describe('Null Operators', () => {
  describe('IsOperator', () => {
    let operator: IsOperator;
    
    beforeEach(() => {
      operator = new IsOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('is');
    });

    test('should handle null value', () => {
      const result = operator.convert('email', 'null');
      expect(result).toEqual({ email: null });
    });

    test('should handle not_null value', () => {
      const result = operator.convert('email', 'not_null');
      expect(result).toEqual({ email: { $ne: null } });
    });

    test('should handle true value', () => {
      const result = operator.convert('active', 'true');
      expect(result).toEqual({ active: true });
    });

    test('should handle false value', () => {
      const result = operator.convert('active', 'false');
      expect(result).toEqual({ active: false });
    });

    test('should handle other values', () => {
      const result = operator.convert('status', 'pending');
      expect(result).toEqual({ status: 'pending' });
    });
  });

  describe('IsDistinctOperator', () => {
    let operator: IsDistinctOperator;
    
    beforeEach(() => {
      operator = new IsDistinctOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('isdistinct');
    });

    test('should convert to $ne operator', () => {
      const result = operator.convert('value', 'test');
      expect(result).toEqual({ value: { $ne: 'test' } });
    });
  });
});

describe('Text Operators', () => {
  describe('LikeOperator', () => {
    let operator: LikeOperator;
    
    beforeEach(() => {
      operator = new LikeOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('like');
    });

    test('should convert to regex with case insensitive flag', () => {
      const result = operator.convert('name', 'John*');
      expect(result).toEqual({ name: { $regex: 'John.*', $options: 'i' } });
    });

    test('should escape special regex characters', () => {
      const result = operator.convert('text', 'hello[world]');
      expect(result).toEqual({ text: { $regex: 'hello\\[world\\]', $options: 'i' } });
    });
  });

  describe('ILikeOperator', () => {
    let operator: ILikeOperator;
    
    beforeEach(() => {
      operator = new ILikeOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('ilike');
    });

    test('should convert to regex with case insensitive flag', () => {
      const result = operator.convert('title', '*search*');
      expect(result).toEqual({ title: { $regex: '.*search.*', $options: 'i' } });
    });
  });

  describe('MatchOperator', () => {
    let operator: MatchOperator;
    
    beforeEach(() => {
      operator = new MatchOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('match');
    });

    test('should convert to regex without options', () => {
      const result = operator.convert('pattern', '^[a-z]+$');
      expect(result).toEqual({ pattern: { $regex: '^[a-z]+$' } });
    });
  });

  describe('IMatchOperator', () => {
    let operator: IMatchOperator;
    
    beforeEach(() => {
      operator = new IMatchOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('imatch');
    });

    test('should convert to regex with case insensitive flag', () => {
      const result = operator.convert('description', '[A-Z]+');
      expect(result).toEqual({ description: { $regex: '[A-Z]+', $options: 'i' } });
    });
  });
});

describe('Logical Operators', () => {
  describe('NotOperator', () => {
    let operator: NotOperator;
    let innerOperator: EqualOperator;
    
    beforeEach(() => {
      operator = new NotOperator();
      innerOperator = new EqualOperator();
    });

    test('should have correct name', () => {
      expect(operator.name).toBe('not');
    });

    test('should convert with inner operator', () => {
      const result = operator.convert('status', 'active', innerOperator);
      expect(result).toEqual({ $not: { status: 'active' } });
    });

    test('should throw error without inner operator', () => {
      expect(() => {
        operator.convert('status', 'active');
      }).toThrow('Not operator requires an inner operator');
    });
  });
});