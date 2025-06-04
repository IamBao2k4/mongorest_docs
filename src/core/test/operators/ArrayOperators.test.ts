import {
  InOperator,
  ContainsOperator,
  ContainedInOperator,
  OverlapOperator
} from '../../operators/arrayOperator';

describe('ArrayOperators', () => {
  describe('InOperator', () => {
    const operator = new InOperator();
    
    it('should parse parentheses array format', () => {
      const result = operator.convert('status', '(active,pending,draft)');
      expect(result).toEqual({ status: { $in: ['active', 'pending', 'draft'] } });
    });
    
    it('should parse curly braces array format', () => {
      const result = operator.convert('id', '{1,2,3}');
      expect(result).toEqual({ id: { $in: [1, 2, 3] } });
    });
    
    it('should handle mixed data types', () => {
      const result = operator.convert('values', '(1,true,null,test)');
      expect(result).toEqual({ values: { $in: [1, true, null, 'test'] } });
    });
  });
  
  describe('ContainsOperator', () => {
    const operator = new ContainsOperator();
    
    it('should convert to $all operator', () => {
      const result = operator.convert('tags', '{javascript,typescript}');
      expect(result).toEqual({ tags: { $all: ['javascript', 'typescript'] } });
    });
  });
  
  describe('ContainedInOperator', () => {
    const operator = new ContainedInOperator();
    
    it('should convert to $in operator', () => {
      const result = operator.convert('categories', '{tech,programming}');
      expect(result).toEqual({ categories: { $in: ['tech', 'programming'] } });
    });
  });
  
  describe('OverlapOperator', () => {
    const operator = new OverlapOperator();
    
    it('should convert to $elemMatch with $in', () => {
      const result = operator.convert('skills', '{js,python,java}');
      expect(result).toEqual({ skills: { $elemMatch: { $in: ['js', 'python', 'java'] } } });
    });
  });
});