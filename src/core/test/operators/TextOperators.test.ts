import {
  LikeOperator,
  ILikeOperator,
  MatchOperator,
  IMatchOperator
} from '../../operators/textOperators';

describe('TextOperators', () => {
  describe('LikeOperator', () => {
    const operator = new LikeOperator();
    
    it('should convert wildcard pattern', () => {
      const result = operator.convert('name', 'John*');
      expect(result).toEqual({ name: { $regex: 'John.*', $options: 'i' } });
    });
    
    it('should handle multiple wildcards', () => {
      const result = operator.convert('email', '*@gmail.*');
      expect(result).toEqual({ email: { $regex: '.*@gmail\\..*', $options: 'i' } });
    });
  });
  
  describe('ILikeOperator', () => {
    const operator = new ILikeOperator();
    
    it('should convert to case-insensitive regex', () => {
      const result = operator.convert('title', 'test*');
      expect(result).toEqual({ title: { $regex: 'test.*', $options: 'i' } });
    });
  });
  
  describe('MatchOperator', () => {
    const operator = new MatchOperator();
    
    it('should convert to regex without case-insensitive flag', () => {
      const result = operator.convert('code', '^[A-Z]{3}$');
      expect(result).toEqual({ code: { $regex: '^[A-Z]{3}$' } });
    });
  });
  
  describe('IMatchOperator', () => {
    const operator = new IMatchOperator();
    
    it('should convert to case-insensitive regex', () => {
      const result = operator.convert('pattern', '^test.*');
      expect(result).toEqual({ pattern: { $regex: '^test.*', $options: 'i' } });
    });
  });
});