import { ManyToManyRelationship } from "../../relationship/manyToManyRelationship"; 

describe('ManyToManyRelationship', () => {
  let relationship: ManyToManyRelationship;

  beforeEach(() => {
    relationship = new ManyToManyRelationship({
      name: 'categories',
      targetTable: 'categories',
      localField: '_id',
      foreignField: '_id',
      type: 'many-to-many',
      junction: {
        table: 'product_categories',
        localKey: 'productId',
        foreignKey: 'categoryId'
      }
    });
  });

  it('should generate correct join condition', () => {
    const condition = relationship.generateJoinCondition();
    expect(condition).toEqual({
      localField: '_id',
      foreignField: 'productId',
      joinType: 'left'
    });
  });

  it('should generate complex lookup stages for junction table', () => {
    const embedRequest = {
      table: 'categories',
      fields: ['name', 'slug'],
      joinHint: 'left'
    };

    const stages = relationship.generateLookupStage(embedRequest);
    expect(Array.isArray(stages)).toBe(true);
    expect(stages).toHaveLength(3);
  });

  it('should have junction lookup as first stage', () => {
    const embedRequest = {
      table: 'categories',
      fields: ['name', 'slug'],
      joinHint: 'left'
    };

    const stages = relationship.generateLookupStage(embedRequest);
    expect(stages[0].$lookup.from).toBe('product_categories');
    expect(stages[0].$lookup.localField).toBe('_id');
    expect(stages[0].$lookup.foreignField).toBe('productId');
    expect(stages[0].$lookup.as).toBe('_junction');
  });

  it('should have target lookup as second stage', () => {
    const embedRequest = {
      table: 'categories',
      fields: ['name', 'slug'],
      joinHint: 'left'
    };

    const stages = relationship.generateLookupStage(embedRequest);
    expect(stages[1].$lookup.from).toBe('categories');
    expect(stages[1].$lookup.localField).toBe('_junction.categoryId');
    expect(stages[1].$lookup.foreignField).toBe('_id');
    expect(stages[1].$lookup.as).toBe('categories');
  });

  it('should have cleanup stage as third stage', () => {
    const embedRequest = {
      table: 'categories',
      fields: ['name', 'slug'],
      joinHint: 'left'
    };

    const stages = relationship.generateLookupStage(embedRequest);
    expect(stages[2].$unset).toBe('_junction');
  });

  it('should be multi-result', () => {
    expect(relationship.isMultiResult()).toBe(true);
  });

  it('should throw error without junction config', () => {
    expect(() => {
      new ManyToManyRelationship({
        name: 'test',
        targetTable: 'test',
        localField: 'id',
        foreignField: 'id',
        type: 'many-to-many'
        // Missing junction config
      });
    }).toThrow('Many-to-many relationship requires junction configuration');
  });

  it('should validate junction configuration', () => {
    expect(relationship.validate()).toBe(true);
  });
});
