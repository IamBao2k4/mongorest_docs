import { OneToManyRelationship } from "../../relationship/oneToManyRelationship";
import { OneToOneRelationship } from "../../relationship/oneToOneRelationship";
import { RelationshipRegistry } from "../../relationship/RelationshipRegistry"; 


describe('RelationshipRegistry', () => {
  let registry: RelationshipRegistry;

  beforeEach(() => {
    registry = new RelationshipRegistry();
  });

  describe('Basic operations', () => {
    it('should register and retrieve relationships', () => {
      const relationship = new OneToOneRelationship({
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      });

      registry.register('users', relationship);
      
      const retrieved = registry.get('users', 'profile');
      expect(retrieved).toBe(relationship);
    });

    it('should register from definition', () => {
      const definition = {
        name: 'posts',
        targetTable: 'posts',
        localField: '_id',
        foreignField: 'author_id',
        type: 'one-to-many' as const
      };

      registry.registerFromDefinition('users', definition);
      
      const relationship = registry.get('users', 'posts');
      expect(relationship).toBeInstanceOf(OneToManyRelationship);
      expect(relationship?.name).toBe('posts');
    });

    it('should check if relationship exists', () => {
      const definition = {
        name: 'author',
        targetTable: 'users',
        localField: 'author_id',
        foreignField: '_id',
        type: 'many-to-one' as const
      };

      registry.registerFromDefinition('posts', definition);
      
      expect(registry.has('posts', 'author')).toBe(true);
      expect(registry.has('posts', 'nonexistent')).toBe(false);
    });

    it('should remove relationships', () => {
      const definition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one' as const
      };

      registry.registerFromDefinition('users', definition);
      expect(registry.has('users', 'profile')).toBe(true);
      
      registry.remove('users', 'profile');
      expect(registry.has('users', 'profile')).toBe(false);
    });

    it('should get all relationships for a table', () => {
      const profileDef = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one' as const
      };

      const postsDef = {
        name: 'posts',
        targetTable: 'posts',
        localField: '_id',
        foreignField: 'author_id',
        type: 'one-to-many' as const
      };

      registry.registerFromDefinition('users', profileDef);
      registry.registerFromDefinition('users', postsDef);
      
      const relationships = registry.getForTable('users');
      expect(relationships).toHaveLength(2);
      expect(relationships.map(r => r.name)).toContain('profile');
      expect(relationships.map(r => r.name)).toContain('posts');
    });

    it('should clear all relationships', () => {
      const definition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one' as const
      };

      registry.registerFromDefinition('users', definition);
      expect(registry.has('users', 'profile')).toBe(true);
      
      registry.clear();
      expect(registry.has('users', 'profile')).toBe(false);
    });
  });

  describe('Bulk operations', () => {
    it('should register bulk relationships', () => {
      const config = {
        users: [
          {
            name: 'profile',
            targetTable: 'user_profiles',
            localField: '_id',
            foreignField: 'user_id',
            type: 'one-to-one' as const
          },
          {
            name: 'posts',
            targetTable: 'posts',
            localField: '_id',
            foreignField: 'author_id',
            type: 'one-to-many' as const
          }
        ],
        posts: [
          {
            name: 'author',
            targetTable: 'users',
            localField: 'author_id',
            foreignField: '_id',
            type: 'many-to-one' as const
          }
        ]
      };

      registry.registerBulk(config);
      
      expect(registry.has('users', 'profile')).toBe(true);
      expect(registry.has('users', 'posts')).toBe(true);
      expect(registry.has('posts', 'author')).toBe(true);
    });

    it('should get all registered relationships', () => {
      const definition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one' as const
      };

      registry.registerFromDefinition('users', definition);
      
      const all = registry.getAll();
      expect(all.size).toBe(1);
      expect(all.has('users.profile')).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unknown relationship type', () => {
      const invalidDefinition = {
        name: 'test',
        targetTable: 'test',
        localField: 'id',
        foreignField: 'id',
        type: 'unknown' as any
      };

      expect(() => {
        registry.registerFromDefinition('test', invalidDefinition);
      }).toThrow('Unknown relationship type: unknown');
    });

    it('should return undefined for non-existent relationship', () => {
      const result = registry.get('nonexistent', 'table');
      expect(result).toBeUndefined();
    });

    it('should return empty array for table with no relationships', () => {
      const relationships = registry.getForTable('nonexistent');
      expect(relationships).toEqual([]);
    });
  });
});