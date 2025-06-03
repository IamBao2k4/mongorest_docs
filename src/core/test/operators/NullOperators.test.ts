import { IsOperator, IsDistinctOperator } from '../../operators/nullOperators';

describe('NullOperators', () => {
  describe('IsOperator', () => {
    const operator = new IsOperator();
    
    it('should handle null value', () => {
      const result = operator.convert('description', 'null');
      expect(result).toEqual({ description: null });
    });
    
    it('should handle not_null value', () => {
      const result = operator.convert('title', 'not_null');
      expect(result).toEqual({ title: { $ne: null } });
    });
    
    it('should handle true value', () => {
      const result = operator.convert('active', 'true');
      expect(result).toEqual({ active: true });
    });
    
    it('should handle false value', () => {
      const result = operator.convert('verified', 'false');
      expect(result).toEqual({ verified: false });
    });
  });
  
  describe('IsDistinctOperator', () => {
    const operator = new IsDistinctOperator();
    
    it('should convert to $ne operator', () => {
      const result = operator.convert('category', 'archived');
      expect(result).toEqual({ category: { $ne: 'archived' } });
    });
  });
});