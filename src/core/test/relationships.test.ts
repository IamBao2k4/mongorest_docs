import { RelationshipRegistry } from '../relationship/RelationshipRegistry';
import { OneToOneRelationship } from '../relationship/oneToOneRelationship';
import { OneToManyRelationship } from '../relationship/oneToManyRelationship';
import { ManyToOneRelationship } from '../relationship/manyToOneRelationship';
import { ManyToManyRelationship } from '../relationship/manyToManyRelationship';
import { JoinParser } from '../relationship/JoinParser';
import { EmbedRequest, RelationshipDefinition } from '../relationship/types';

describe('RelationshipRegistry', () => {
  let registry: RelationshipRegistry;

  beforeEach(() => {
    registry = new RelationshipRegistry();
  });

  describe('register and get', () => {
    test('should register and retrieve a relationship', () => {
      const definition: RelationshipDefinition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      };
      const relationship = new OneToOneRelationship(definition);

      registry.register('users', relationship);
      const retrieved = registry.get('users', 'profile');

      expect(retrieved).toBe(relationship);
    });

    test('should return undefined for non-existent relationship', () => {
      const result = registry.get('users', 'nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('registerFromDefinition', () => {
    test('should register one-to-one relationship from definition', () => {
      const definition: RelationshipDefinition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      };

      registry.registerFromDefinition('users', definition);
      const relationship = registry.get('users', 'profile');

      expect(relationship).toBeInstanceOf(OneToOneRelationship);
      expect(relationship?.name).toBe('profile');
    });

    test('should register one-to-many relationship from definition', () => {
      const definition: RelationshipDefinition = {
        name: 'posts',
        targetTable: 'posts',
        localField: '_id',
        foreignField: 'author_id',
        type: 'one-to-many'
      };

      registry.registerFromDefinition('users', definition);
      const relationship = registry.get('users', 'posts');

      expect(relationship).toBeInstanceOf(OneToManyRelationship);
      expect(relationship?.name).toBe('posts');
    });

    test('should register many-to-one relationship from definition', () => {
      const definition: RelationshipDefinition = {
        name: 'author',
        targetTable: 'users',
        localField: 'author_id',
        foreignField: '_id',
        type: 'many-to-one'
      };

      registry.registerFromDefinition('posts', definition);
      const relationship = registry.get('posts', 'author');

      expect(relationship).toBeInstanceOf(ManyToOneRelationship);
      expect(relationship?.name).toBe('author');
    });

    test('should register many-to-many relationship from definition', () => {
      const definition: RelationshipDefinition = {
        name: 'categories',
        targetTable: 'categories',
        localField: '_id',
        foreignField: '_id',
        type: 'many-to-many',
        junction: {
          table: 'product_categories',
          localKey: 'product_id',
          foreignKey: 'category_id'
        }
      };

      registry.registerFromDefinition('products', definition);
      const relationship = registry.get('products', 'categories');

      expect(relationship).toBeInstanceOf(ManyToManyRelationship);
      expect(relationship?.name).toBe('categories');
    });

    test('should throw error for unknown relationship type', () => {
      const definition = {
        name: 'test',
        targetTable: 'test_table',
        localField: '_id',
        foreignField: 'test_id',
        type: 'unknown' as any
      };

      expect(() => {
        registry.registerFromDefinition('test', definition);
      }).toThrow('Unknown relationship type: unknown');
    });
  });

  describe('has', () => {
    test('should return true for existing relationship', () => {
      const definition: RelationshipDefinition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      };

      registry.registerFromDefinition('users', definition);
      expect(registry.has('users', 'profile')).toBe(true);
    });

    test('should return false for non-existent relationship', () => {
      expect(registry.has('users', 'nonexistent')).toBe(false);
    });
  });

  describe('getForTable', () => {
    test('should return all relationships for a table', () => {
      const definitions: RelationshipDefinition[] = [
        {
          name: 'profile',
          targetTable: 'user_profiles',
          localField: '_id',
          foreignField: 'user_id',
          type: 'one-to-one'
        },
        {
          name: 'posts',
          targetTable: 'posts',
          localField: '_id',
          foreignField: 'author_id',
          type: 'one-to-many'
        }
      ];

      definitions.forEach(def => registry.registerFromDefinition('users', def));
      const relationships = registry.getForTable('users');

      expect(relationships).toHaveLength(2);
      expect(relationships.map(r => r.name)).toContain('profile');
      expect(relationships.map(r => r.name)).toContain('posts');
    });

    test('should return empty array for table with no relationships', () => {
      const relationships = registry.getForTable('empty_table');
      expect(relationships).toEqual([]);
    });
  });

  describe('remove', () => {
    test('should remove existing relationship', () => {
      const definition: RelationshipDefinition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      };

      registry.registerFromDefinition('users', definition);
      expect(registry.has('users', 'profile')).toBe(true);

      const removed = registry.remove('users', 'profile');
      expect(removed).toBe(true);
      expect(registry.has('users', 'profile')).toBe(false);
    });

    test('should return false for non-existent relationship', () => {
      const removed = registry.remove('users', 'nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    test('should clear all relationships', () => {
      const definition: RelationshipDefinition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      };

      registry.registerFromDefinition('users', definition);
      expect(registry.has('users', 'profile')).toBe(true);

      registry.clear();
      expect(registry.has('users', 'profile')).toBe(false);
    });
  });

  describe('registerBulk', () => {
    test('should register multiple relationships from config', () => {
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
  });

  describe('getAll', () => {
    test('should return copy of all relationships', () => {
      const definition: RelationshipDefinition = {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      };

      registry.registerFromDefinition('users', definition);
      const allRelationships = registry.getAll();

      expect(allRelationships.size).toBe(1);
      expect(allRelationships.has('users.profile')).toBe(true);

      // Should be a copy, not the original
      allRelationships.clear();
      expect(registry.has('users', 'profile')).toBe(true);
    });
  });
});

describe('Relationship Classes', () => {
  describe('OneToOneRelationship', () => {
    let relationship: OneToOneRelationship;
    const definition: RelationshipDefinition = {
      name: 'profile',
      targetTable: 'user_profiles',
      localField: '_id',
      foreignField: 'user_id',
      type: 'one-to-one'
    };

    beforeEach(() => {
      relationship = new OneToOneRelationship(definition);
    });

    test('should have correct properties', () => {
      expect(relationship.name).toBe('profile');
      expect(relationship.targetTable).toBe('user_profiles');
      expect(relationship.localField).toBe('_id');
      expect(relationship.foreignField).toBe('user_id');
      expect(relationship.type).toBe('one-to-one');
    });

    test('should not be multi-result', () => {
      expect(relationship.isMultiResult()).toBe(false);
    });

    test('should generate correct join condition', () => {
      const joinCondition = relationship.generateJoinCondition();
      expect(joinCondition).toEqual({
        localField: '_id',
        foreignField: 'user_id',
        joinType: 'left'
      });
    });

    test('should generate correct lookup stage', () => {
      const embedRequest: EmbedRequest = {
        table: 'profile',
        fields: ['name', 'bio'],
        filters: {},
        joinHint: 'left'
      };

      const lookupStage = relationship.generateLookupStage(embedRequest);
      expect(lookupStage).toEqual({
        $lookup: {
          from: 'user_profiles',
          localField: '_id',
          foreignField: 'user_id',
          as: 'profile',
          pipeline: [
            {
              $project: {
                name: 1,
                bio: 1
              }
            }
          ]
        }
      });
    });

    test('should validate definition', () => {
      expect(relationship.validate()).toBe(true);
    });
  });

  describe('OneToManyRelationship', () => {
    let relationship: OneToManyRelationship;
    const definition: RelationshipDefinition = {
      name: 'posts',
      targetTable: 'posts',
      localField: '_id',
      foreignField: 'author_id',
      type: 'one-to-many'
    };

    beforeEach(() => {
      relationship = new OneToManyRelationship(definition);
    });

    test('should be multi-result', () => {
      expect(relationship.isMultiResult()).toBe(true);
    });

    test('should generate correct lookup stage with pipeline', () => {
      const embedRequest: EmbedRequest = {
        table: 'posts',
        fields: ['title', 'content'],
        filters: { status: 'published' },
        orderBy: ['created_at.desc'],
        limit: 10,
        joinHint: 'left'
      };

      const lookupStage = relationship.generateLookupStage(embedRequest);
      expect(lookupStage.$lookup.from).toBe('posts');
      expect(lookupStage.$lookup.localField).toBe('_id');
      expect(lookupStage.$lookup.foreignField).toBe('author_id');
      expect(lookupStage.$lookup.as).toBe('posts');
    });
  });

  describe('ManyToOneRelationship', () => {
    let relationship: ManyToOneRelationship;
    const definition: RelationshipDefinition = {
      name: 'author',
      targetTable: 'users',
      localField: 'author_id',
      foreignField: '_id',
      type: 'many-to-one'  
    };

    beforeEach(() => {
      relationship = new ManyToOneRelationship(definition);
    });

    test('should not be multi-result', () => {
      expect(relationship.isMultiResult()).toBe(false);
    });

    test('should generate correct lookup stage', () => {
      const embedRequest: EmbedRequest = {
        table: 'author',
        fields: ['name', 'email'],
        filters: {},
        joinHint: 'left'
      };

      const lookupStage = relationship.generateLookupStage(embedRequest);
      expect(lookupStage.$lookup.from).toBe('users');
      expect(lookupStage.$lookup.localField).toBe('author_id');
      expect(lookupStage.$lookup.foreignField).toBe('_id');
      expect(lookupStage.$lookup.as).toBe('author');
    });
  });

  describe('ManyToManyRelationship', () => {
    let relationship: ManyToManyRelationship;
    const definition: RelationshipDefinition = {
      name: 'categories',
      targetTable: 'categories',
      localField: '_id',
      foreignField: '_id',
      type: 'many-to-many',
      junction: {
        table: 'product_categories',
        localKey: 'product_id',
        foreignKey: 'category_id'
      }
    };

    beforeEach(() => {
      relationship = new ManyToManyRelationship(definition);
    });

    test('should be multi-result', () => {
      expect(relationship.isMultiResult()).toBe(true);
    });

    test('should throw error without junction config', () => {
      const invalidDefinition = { ...definition };
      delete invalidDefinition.junction;

      expect(() => {
        new ManyToManyRelationship(invalidDefinition);
      }).toThrow('Many-to-many relationship requires junction configuration');
    });

    test('should generate correct join condition', () => {
      const joinCondition = relationship.generateJoinCondition();
      expect(joinCondition).toEqual({
        localField: '_id',
        foreignField: 'product_id',
        joinType: 'left'
      });
    });

    test('should generate correct lookup stages', () => {
      const embedRequest: EmbedRequest = {
        table: 'categories',
        fields: ['name', 'description'],
        filters: {},
        joinHint: 'left'
      };

      const lookupStages = relationship.generateLookupStage(embedRequest);
      expect(Array.isArray(lookupStages)).toBe(true);
      expect(lookupStages).toHaveLength(3);

      // First stage: junction lookup
      expect(lookupStages[0].$lookup.from).toBe('product_categories');
      expect(lookupStages[0].$lookup.localField).toBe('_id');
      expect(lookupStages[0].$lookup.foreignField).toBe('product_id');
      expect(lookupStages[0].$lookup.as).toBe('_junction');

      // Second stage: target lookup
      expect(lookupStages[1].$lookup.from).toBe('categories');
      expect(lookupStages[1].$lookup.localField).toBe('_junction.category_id');
      expect(lookupStages[1].$lookup.foreignField).toBe('_id');
      expect(lookupStages[1].$lookup.as).toBe('categories');

      // Third stage: cleanup
      expect(lookupStages[2].$unset).toBe('_junction');
    });
  });
});

describe('JoinParser', () => {
  let parser: JoinParser;
  let registry: RelationshipRegistry;

  beforeEach(() => {
    registry = new RelationshipRegistry();
    
    // Setup test relationships
    const userDefinitions: RelationshipDefinition[] = [
      {
        name: 'profile',
        targetTable: 'user_profiles',
        localField: '_id',
        foreignField: 'user_id',
        type: 'one-to-one'
      },
      {
        name: 'posts',
        targetTable: 'posts',
        localField: '_id',
        foreignField: 'author_id',
        type: 'one-to-many'
      }
    ];

    const postDefinitions: RelationshipDefinition[] = [
      {
        name: 'author',
        targetTable: 'users',
        localField: 'author_id',
        foreignField: '_id',
        type: 'many-to-one'
      }
    ];

    userDefinitions.forEach(def => registry.registerFromDefinition('users', def));
    postDefinitions.forEach(def => registry.registerFromDefinition('posts', def));

    parser = new JoinParser(registry);
  });

  describe('parseEmbedExpression', () => {
    test('should parse simple embed expression', () => {
      const result = parser.parseEmbedExpression('users', 'profile(name,bio)');
      
      expect(result).toEqual({
        table: 'profile',
        fields: ['name', 'bio'],
        filters: {},
        children: [],
        joinHint: 'left'
      });
    });

    test('should parse embed with join hint', () => {
      const result = parser.parseEmbedExpression('users', 'profile!inner(name,bio)');
      
      expect(result).toEqual({
        table: 'profile',
        fields: ['name', 'bio'],
        filters: {},
        children: [],
        joinHint: 'inner'
      });
    });

    test('should parse embed with filters', () => {
      const result = parser.parseEmbedExpression('users', 'posts(title,content,status=eq.published)');
      
      expect(result?.table).toBe('posts');
      expect(result?.fields).toEqual(['title', 'content']);
      expect(result?.filters).toEqual({ status: 'eq.published' });
    });

    test('should return null for non-existent relationship', () => {
      const result = parser.parseEmbedExpression('users', 'nonexistent(field)');
      expect(result).toBeNull();
    });

    test('should parse nested embed expressions', () => {
      // First register the nested relationship
      registry.registerFromDefinition('posts', {
        name: 'comments',
        targetTable: 'comments',
        localField: '_id',
        foreignField: 'post_id',
        type: 'one-to-many'
      });

      const result = parser.parseEmbedExpression('users', 'posts(title,comments(content,author))');
      
      expect(result?.table).toBe('posts');
      expect(result?.fields).toEqual(['title']);
      expect(result?.children).toHaveLength(1);
      expect(result?.children?.[0]?.table).toBe('comments');
    });

    test('should handle empty field list', () => {
      const result = parser.parseEmbedExpression('users', 'profile()');
      
      expect(result?.table).toBe('profile');
      expect(result?.fields).toEqual([]);
    });

    test('should return null for malformed expression', () => {
      const result = parser.parseEmbedExpression('users', 'invalid_expression');
      expect(result).toBeNull();
    });
  });

  describe('generateLookupStages', () => {
    test('should generate lookup stages for simple embed', () => {
      const embedRequest: EmbedRequest = {
        table: 'profile',
        fields: ['name', 'bio'],
        filters: {},
        joinHint: 'left'
      };

      const stages = parser.generateLookupStages('users', embedRequest);
      expect(stages).toHaveLength(1);
      expect(stages[0].$lookup).toBeDefined();
      expect(stages[0].$lookup.from).toBe('user_profiles');
    });

    test('should throw error for non-existent relationship', () => {
      const embedRequest: EmbedRequest = {
        table: 'nonexistent',
        fields: ['field'],
        filters: {},
        joinHint: 'left'
      };

      expect(() => {
        parser.generateLookupStages('users', embedRequest);
      }).toThrow('Relationship users.nonexistent not found');
    });

    test('should handle embed with inner join hint', () => {
      const embedRequest: EmbedRequest = {
        table: 'profile',
        fields: ['name'],
        filters: {},
        joinHint: 'inner'
      };

      const stages = parser.generateLookupStages('users', embedRequest);
      expect(stages.length).toBeGreaterThan(1);
      
      // Should have unwind stage for inner join on single result relationship
      const unwindStage = stages.find(stage => stage.$unwind);
      expect(unwindStage).toBeDefined();
      expect(unwindStage.$unwind.preserveNullAndEmptyArrays).toBe(false);
    });
  });

  describe('buildLogicNested', () => {
    test('should build nested logic for simple filters', () => {
      const params = {
        name: 'eq.John',
        age: 'gt.18'
      };

      const result = parser.buildLogicNested(params);
      
      expect(result.filter).toBeDefined();
      expect(result.filter.$and).toHaveLength(2);
    });

    test('should handle logical operators', () => {
      const params = {
        or: '(name=eq.John,name=eq.Jane)'
      };

      const result = parser.buildLogicNested(params);
      expect(result.filter.$or).toBeDefined();
    });

    test('should handle single condition', () => {
      const params = {
        name: 'eq.John'
      };

      const result = parser.buildLogicNested(params);
      expect(result.filter.name).toBe('John');
    });

    test('should handle array parameters', () => {
      const params = {
        name: ['eq.John']
      };

      const result = parser.buildLogicNested(params);
      expect(result.filter.name).toBe('John');
    });
  });
});