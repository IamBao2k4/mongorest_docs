import { FilterParser } from '../../parsers/filterParser';

describe('FilterParser', () => {
  let parser: FilterParser;
  
  beforeEach(() => {
    parser = new FilterParser();
  });
  
  describe('parseFilter', () => {
    it('should parse simple equality filter', () => {
      const result = parser.parseFilter('name', 'eq.John');
      expect(result).toEqual({
        field: 'name',
        operator: 'eq',
        value: 'John'
      });
    });
    
    it('should parse filter with multiple dots in value', () => {
      const result = parser.parseFilter('email', 'eq.user@example.com');
      expect(result).toEqual({
        field: 'email',
        operator: 'eq',
        value: 'user@example.com'
      });
    });
    
    it('should default to eq operator when no operator specified', () => {
      const result = parser.parseFilter('status', 'active');
      expect(result).toEqual({
        field: 'status',
        operator: 'eq',
        value: 'active'
      });
    });
    
    it('should parse modifier operators', () => {
      const result = parser.parseFilter('name', 'like(any).{John*,Jane*}');
      expect(result).toEqual({
        field: 'name',
        operator: 'like',
        value: '{John*,Jane*}',
        modifier: 'any'
      });
    });
  });
  
  describe('convertFilter', () => {
    it('should convert basic filter to MongoDB query', () => {
      const filter = { field: 'age', operator: 'gte', value: '18' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({ age: { $gte: 18 } });
    });
    
    it('should handle any modifier', () => {
      const filter = {
        field: 'name',
        operator: 'like',
        value: '{John*,Jane*}',
        modifier: 'any'
      };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({
        $or: [
          { name: { $regex: 'John.*', $options: 'i' } },
          { name: { $regex: 'Jane.*', $options: 'i' } }
        ]
      });
    });
    
    it('should handle all modifier', () => {
      const filter = {
        field: 'tags',
        operator: 'like',
        value: '{tech*,*script}',
        modifier: 'all'
      };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({
        $and: [
          { tags: { $regex: 'tech.*', $options: 'i' } },
          { tags: { $regex: '.*script', $options: 'i' } }
        ]
      });
    });
    
    it('should throw error for unknown operator', () => {
      const filter = { field: 'test', operator: 'unknown', value: 'value' };
      expect(() => parser.convertFilter(filter)).toThrow('Unknown operator: unknown');
    });
  });
});