import { FilterParser } from '../parsers/filterParser';
import { LogicalParser } from '../parsers/logicalParser';
import { OrderParser } from '../parsers/orderParser';
import { ModularSelectParser, createRelationshipConfig, SAMPLE_RELATIONSHIPS } from '../parsers/selectParser';

describe('FilterParser', () => {
  let parser: FilterParser;

  beforeEach(() => {
    parser = new FilterParser();
  });

  describe('parseFilter', () => {
    test('should parse simple equal filter', () => {
      const result = parser.parseFilter('name', 'eq.John');
      expect(result).toEqual({
        field: 'name',
        operator: 'eq',
        value: 'John'
      });
    });

    test('should parse filter with dots in value', () => {
      const result = parser.parseFilter('email', 'eq.john.doe@example.com');
      expect(result).toEqual({
        field: 'email',
        operator: 'eq',
        value: 'john.doe@example.com'
      });
    });

    test('should default to eq operator when no operator specified', () => {
      const result = parser.parseFilter('status', 'active');
      expect(result).toEqual({
        field: 'status',
        operator: 'eq',
        value: 'active'
      });
    });

    test('should parse filter with modifier', () => {
      const result = parser.parseFilter('tags', 'like(any).test');
      expect(result).toEqual({
        field: 'tags',
        operator: 'like',
        value: 'test',
        modifier: 'any'
      });
    });

    test('should parse complex operators', () => {
      const result = parser.parseFilter('age', 'gte.18');
      expect(result).toEqual({
        field: 'age',
        operator: 'gte',
        value: '18'
      });
    });
  });

  describe('convertFilter', () => {
    test('should convert equal filter', () => {
      const filter = { field: 'name', operator: 'eq', value: 'John' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({ name: 'John' });
    });

    test('should convert greater than filter', () => {
      const filter = { field: 'age', operator: 'gt', value: '18' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({ age: { $gt: 18 } });
    });

    test('should convert in filter', () => {
      const filter = { field: 'status', operator: 'in', value: '(active,inactive)' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({ status: { $in: ['active', 'inactive'] } });
    });

    test('should convert like filter', () => {
      const filter = { field: 'name', operator: 'like', value: 'John*' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({ name: { $regex: 'John.*', $options: 'i' } });
    });

    test('should throw error for unknown operator', () => {
      const filter = { field: 'name', operator: 'unknown', value: 'test' };
      expect(() => parser.convertFilter(filter)).toThrow('Unknown operator: unknown');
    });

    test('should handle modifier with any', () => {
      const filter = { field: 'tags', operator: 'like', value: '(red,blue)', modifier: 'any' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({
        $or: [
          { tags: { $regex: 'red', $options: 'i' } },
          { tags: { $regex: 'blue', $options: 'i' } }
        ]
      });
    });

    test('should handle modifier with all', () => {
      const filter = { field: 'tags', operator: 'like', value: '(red,blue)', modifier: 'all' };
      const result = parser.convertFilter(filter);
      expect(result).toEqual({
        $and: [
          { tags: { $regex: 'red', $options: 'i' } },
          { tags: { $regex: 'blue', $options: 'i' } }
        ]
      });
    });
  });
});

describe('LogicalParser', () => {
  let parser: LogicalParser;

  beforeEach(() => {
    parser = new LogicalParser();
  });

  describe('parseLogical', () => {
    test('should parse OR expression', () => {
      const result = parser.parseLogical('or=(age=lt.18,age=gt.65)');
      expect(result).toEqual({
        $or: [
          { age: { $lt: 18 } },
          { age: { $gt: 65 } }
        ]
      });
    });

    test('should parse AND expression', () => {
      const result = parser.parseLogical('and=(age=gte.18,status=eq.active)');
      expect(result).toEqual({
        $and: [
          { age: { $gte: 18 } },
          { status: 'active' }
        ]
      });
    });

    test('should parse NOT expression with AND', () => {
      const result = parser.parseLogical('not.and=(age=lt.18,status=eq.inactive)');
      expect(result).toEqual({
        $not: {
          $and: [
            { age: { $lt: 18 } },
            { status: 'inactive' }
          ]
        }
      });
    });

    test('should parse NOT expression with OR', () => {
      const result = parser.parseLogical('not.or=(status=eq.draft,status=eq.pending)');
      expect(result).toEqual({
        $not: {
          $or: [
            { status: 'draft' },
            { status: 'pending' }
          ]
        }
      });
    });

    test('should parse single condition NOT', () => {
      const result = parser.parseLogical('not.status.eq.active');
      expect(result).toEqual({
        $not: { status: 'active' }
      });
    });

    test('should return null for non-logical expression', () => {
      const result = parser.parseLogical('name.eq.John');
      expect(result).toBeNull();
    });

    test('should handle complex nested conditions', () => {
      const result = parser.parseLogical('or=(age=gte.18,status=eq.admin)');
      expect(result).toEqual({
        $or: [
          { age: { $gte: 18 } },
          { status: 'admin' }
        ]
      });
    });
  });
});

describe('OrderParser', () => {
  let parser: OrderParser;

  beforeEach(() => {
    parser = new OrderParser();
  });

  describe('parseOrder', () => {
    test('should parse single field ascending', () => {
      const result = parser.parseOrder('name');
      expect(result).toEqual({ name: 1 });
    });

    test('should parse single field descending', () => {
      const result = parser.parseOrder('age.desc');
      expect(result).toEqual({ age: -1 });
    });

    test('should parse multiple fields', () => {
      const result = parser.parseOrder('name.asc,age.desc,created_at');
      expect(result).toEqual({
        name: 1,
        age: -1,
        created_at: 1
      });
    });

    test('should handle empty order clause', () => {
      const result = parser.parseOrder('');
      expect(result).toEqual({});
    });

    test('should handle null order clause', () => {
      const result = parser.parseOrder(null as any);
      expect(result).toEqual({});
    });

    test('should handle undefined order clause', () => {
      const result = parser.parseOrder(undefined as any);
      expect(result).toEqual({});
    });

    test('should handle whitespace in field names', () => {
      const result = parser.parseOrder(' name.asc , age.desc , score ');
      expect(result).toEqual({
        name: 1,
        age: -1,
        score: 1
      });
    });

    test('should default to ascending for unknown direction', () => {
      const result = parser.parseOrder('name.invalid');
      expect(result).toEqual({ name: 1 });
    });
  });
});

describe('ModularSelectParser', () => {
  let parser: ModularSelectParser;
  let registry: any;

  beforeEach(() => {
    registry = createRelationshipConfig(SAMPLE_RELATIONSHIPS);
    parser = new ModularSelectParser(registry);
  });

  describe('parseSelect', () => {
    test('should handle wildcard select', () => {
      const result = parser.parseSelect('users', '*');
      expect(result).toEqual({
        fields: {},
        pipeline: [],
        embeds: []
      });
    });

    test('should handle empty select', () => {
      const result = parser.parseSelect('users', '');
      expect(result).toEqual({
        fields: {},
        pipeline: [],
        embeds: []
      });
    });

    test('should parse regular fields', () => {
      const result = parser.parseSelect('users', 'name,email,age');
      expect(result.fields).toEqual({
        name: 1,
        email: 1,
        age: 1
      });
      expect(result.pipeline).toEqual([]);
      expect(result.embeds).toEqual([]);
    });

    test('should parse field with alias', () => {
      const result = parser.parseSelect('users', 'user_name:name,user_email:email');
      expect(result.fields).toEqual({
        name: 1,
        email: 1
      });
    });

    test('should parse field with type casting', () => {
      const result = parser.parseSelect('users', 'price::text,id::integer');
      expect(result.fields).toEqual({
        price: 1,
        id: 1
      });
    });

    test('should parse JSON path fields', () => {
      const result = parser.parseSelect('users', 'metadata->name,settings->theme');
      expect(result.fields).toEqual({
        metadata: 1,
        settings: 1
      });
    });

    test('should handle complex field expressions', () => {
      const result = parser.parseSelect('users', 'name,email,age::integer,profile->avatar');
      expect(result.fields).toEqual({
        name: 1,
        email: 1,
        age: 1,
        profile: 1
      });
    });

    test('should handle mixed regular fields and embeds', () => {
      const result = parser.parseSelect('users', 'name,email,profile(name,bio)');
      expect(result.fields).toEqual({
        name: 1,
        email: 1
      });
      expect(result.embeds).toContain('profile');
      expect(result.pipeline.length).toBeGreaterThan(0);
    });
  });

  describe('tokenization', () => {
    test('should tokenize simple fields', () => {
      const result = parser.parseSelect('users', 'name,email,age');
      expect(result.fields).toEqual({
        name: 1,
        email: 1,
        age: 1
      });
    });

    test('should handle quoted strings', () => {
      const result = parser.parseSelect('users', 'name,"complex,field",age');
      expect(result.fields).toEqual({
        name: 1,
        '"complex,field"': 1,
        age: 1
      });
    });

    test('should handle nested parentheses', () => {
      const result = parser.parseSelect('users', 'name,posts(title,author(name))');
      expect(result.fields).toEqual({
        name: 1
      });
      expect(result.embeds).toContain('posts');
    });
  });

  describe('embed detection', () => {
    test('should detect valid embed expressions', () => {
      const result = parser.parseSelect('users', 'profile(name,bio)');
      expect(result.embeds).toContain('profile');
    });

    test('should not detect quoted strings as embeds', () => {
      const result = parser.parseSelect('users', '"field(with,parens)"');
      expect(result.embeds).toEqual([]);
      expect(result.fields).toEqual({
        '"field(with,parens)"': 1
      });
    });

    test('should not detect incomplete parentheses as embeds', () => {
      const result = parser.parseSelect('users', 'field(incomplete');
      expect(result.embeds).toEqual([]);
      expect(result.fields).toEqual({
        'field(incomplete': 1
      });
    });
  });
});

describe('createRelationshipConfig', () => {
  test('should create relationship registry from config', () => {
    const config = {
      users: [
        {
          name: 'profile',
          targetTable: 'user_profiles',
          localField: '_id',
          foreignField: 'user_id',
          type: 'one-to-one' as const
        }
      ]
    };

    const registry = createRelationshipConfig(config);
    expect(registry.has('users', 'profile')).toBe(true);
  });

  test('should handle multiple relationships', () => {
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
      ]
    };

    const registry = createRelationshipConfig(config);
    expect(registry.has('users', 'profile')).toBe(true);
    expect(registry.has('users', 'posts')).toBe(true);
  });
});

describe('SAMPLE_RELATIONSHIPS', () => {
  test('should have valid structure', () => {
    expect(SAMPLE_RELATIONSHIPS).toBeDefined();
    expect(SAMPLE_RELATIONSHIPS.users).toBeDefined();
    expect(SAMPLE_RELATIONSHIPS.orders).toBeDefined();
    expect(SAMPLE_RELATIONSHIPS.products).toBeDefined();
    expect(SAMPLE_RELATIONSHIPS.categories).toBeDefined();
  });

  test('should have valid relationship definitions', () => {
    const userRelationships = SAMPLE_RELATIONSHIPS.users;
    expect(userRelationships).toHaveLength(4);
    
    const profileRelationship = userRelationships.find(r => r.name === 'profile');
    expect(profileRelationship).toBeDefined();
    expect(profileRelationship?.type).toBe('one-to-one');
    expect(profileRelationship?.targetTable).toBe('user_profiles');
  });

  test('should have many-to-many relationships with junction config', () => {
    const productRelationships = SAMPLE_RELATIONSHIPS.products;
    const categoriesRelationship = productRelationships.find(r => r.name === 'categories');
    
    expect(categoriesRelationship).toBeDefined();
    expect(categoriesRelationship?.type).toBe('many-to-many');
    expect(categoriesRelationship?.junction).toBeDefined();
    expect(categoriesRelationship?.junction?.table).toBe('product_categories');
  });
});