import { JoinParser } from "../../relationship/JoinParser";
import { RelationshipRegistry } from "../../relationship/RelationshipRegistry"; 
describe('JoinParser', () => {
  let parser: JoinParser;
  let registry: RelationshipRegistry;

  beforeEach(() => {
    registry = new RelationshipRegistry();
    
    // Setup test relationships
    registry.registerFromDefinition('users', {
      name: 'profile',
      targetTable: 'user_profiles',
      localField: '_id',
      foreignField: 'user_id',
      type: 'one-to-one'
    });

    registry.registerFromDefinition('users', {
      name: 'posts',
      targetTable: 'posts',
      localField: '_id',
      foreignField: 'author_id',
      type: 'one-to-many'
    });

    parser = new JoinParser(registry);
  });

  describe('parseEmbedExpression', () => {
    it('should parse simple embed expression', () => {
      const result = parser.parseEmbedExpression('users', 'profile(avatar,bio)');
      
      expect(result).toEqual({
        table: 'profile',
        fields: ['avatar', 'bio'],
        joinHint: 'left'
      });
    });

    it('should parse embed with join hint', () => {
      const result = parser.parseEmbedExpression('users', 'posts!inner(title,content)');
      
      expect(result).toEqual({
        table: 'posts',
        fields: ['title', 'content'],
        joinHint: 'inner'
      });
    });

    it('should parse embed without parentheses', () => {
      const result = parser.parseEmbedExpression('users', 'profile');
      
      expect(result).toEqual({
        table: 'profile',
        fields: [],
        joinHint: 'left'
      });
    });

    it('should return null for non-existent relationship', () => {
      const result = parser.parseEmbedExpression('users', 'nonexistent(field)');
      expect(result).toBeNull();
    });

    it('should return null for malformed expression', () => {
      const result = parser.parseEmbedExpression('users', 'invalid');
      expect(result).toBeNull();
    });

    it('should handle empty fields', () => {
      const result = parser.parseEmbedExpression('users', 'profile()');
      
      expect(result).toEqual({
        table: 'profile',
        fields: [],
        joinHint: 'left'
      });
    });

    it('should parse fields with spaces', () => {
      const result = parser.parseEmbedExpression('users', 'profile( avatar , bio , name )');
      
      expect(result?.fields).toEqual(['avatar', 'bio', 'name']);
    });
  });

  describe('generateLookupStages', () => {
    it('should generate lookup stages for one-to-one relationship', () => {
      const embedRequest = {
        table: 'profile',
        fields: ['avatar', 'bio'],
        joinHint: 'left'
      };

      const stages = parser.generateLookupStages('users', embedRequest);
      
      expect(stages).toHaveLength(2); // lookup + addFields for single result
      expect(stages[0].$lookup).toBeDefined();
      expect(stages[1].$addFields).toBeDefined();
    });

    it('should generate lookup stages for one-to-many relationship', () => {
      const embedRequest = {
        table: 'posts',
        fields: ['title', 'content'],
        joinHint: 'left'
      };

      const stages = parser.generateLookupStages('users', embedRequest);
      
      expect(stages).toHaveLength(1); // Only lookup for array result
      expect(stages[0].$lookup).toBeDefined();
    });

    it('should generate unwind stage for inner join', () => {
      const embedRequest = {
        table: 'profile',
        fields: ['avatar', 'bio'],
        joinHint: 'inner'
      };

      const stages = parser.generateLookupStages('users', embedRequest);
      
      expect(stages[1].$unwind).toBeDefined();
      expect(stages[1].$unwind.preserveNullAndEmptyArrays).toBe(false);
    });

    it('should throw error for non-existent relationship', () => {
      const embedRequest = {
        table: 'nonexistent',
        fields: ['field'],
        joinHint: 'left'
      };

      expect(() => {
        parser.generateLookupStages('users', embedRequest);
      }).toThrow('Relationship users.nonexistent not found');
    });
  });
});