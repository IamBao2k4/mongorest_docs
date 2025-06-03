import {
  EqualOperator,
  NotEqualOperator,
  GreaterThanOperator,
  GreaterThanEqualOperator,
  LessThanOperator,
  LessThanEqualOperator
} from '../../operators/comparisonOperators';

describe('ComparisonOperators', () => {
  describe('EqualOperator', () => {
    const operator = new EqualOperator();
    
    it('should convert string value', () => {
      const result = operator.convert('name', 'John');
      expect(result).toEqual({ name: 'John' });
    });
    
    it('should convert number value', () => {
      const result = operator.convert('age', '25');
      expect(result).toEqual({ age: 25 });
    });
    
    it('should convert boolean value', () => {
      const result = operator.convert('active', 'true');
      expect(result).toEqual({ active: true });
    });
    
    it('should convert null value', () => {
      const result = operator.convert('description', 'null');
      expect(result).toEqual({ description: null });
    });
  });
  
  describe('NotEqualOperator', () => {
    const operator = new NotEqualOperator();
    
    it('should convert to $ne operator', () => {
      const result = operator.convert('status', 'inactive');
      expect(result).toEqual({ status: { $ne: 'inactive' } });
    });
  });
  
  describe('GreaterThanOperator', () => {
    const operator = new GreaterThanOperator();
    
    it('should convert to $gt operator', () => {
      const result = operator.convert('age', '18');
      expect(result).toEqual({ age: { $gt: 18 } });
    });
  });
  
  describe('GreaterThanEqualOperator', () => {
    const operator = new GreaterThanEqualOperator();
    
    it('should convert to $gte operator', () => {
      const result = operator.convert('score', '90');
      expect(result).toEqual({ score: { $gte: 90 } });
    });
  });
  
  describe('LessThanOperator', () => {
    const operator = new LessThanOperator();
    
    it('should convert to $lt operator', () => {
      const result = operator.convert('age', '65');
      expect(result).toEqual({ age: { $lt: 65 } });
    });
  });
  
  describe('LessThanEqualOperator', () => {
    const operator = new LessThanEqualOperator();
    
    it('should convert to $lte operator', () => {
      const result = operator.convert('price', '100');
      expect(result).toEqual({ price: { $lte: 100 } });
    });
  });
});