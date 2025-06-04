import { ManyToOneRelationship } from "../../relationship/manyToOneRelationship";

describe('ManyToOneRelationship', () => {
  let relationship: ManyToOneRelationship;

  beforeEach(() => {
    relationship = new ManyToOneRelationship({
      name: 'author',
      targetTable: 'users',
      localField: 'author_id',
      foreignField: '_id',
      type: 'many-to-one'
    });
  });

  it('should generate correct join condition', () => {
    const condition = relationship.generateJoinCondition();
    expect(condition).toEqual({
      localField: 'author_id',
      foreignField: '_id',
      joinType: 'left'
    });
  });

  it('should generate basic lookup stage', () => {
    const embedRequest = {
      table: 'author',
      fields: ['name', 'email'],
      joinHint: 'inner'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.from).toBe('users');
    expect(stage.$lookup.localField).toBe('author_id');
    expect(stage.$lookup.foreignField).toBe('_id');
    expect(stage.$lookup.as).toBe('author');
  });

  it('should not be multi-result', () => {
    expect(relationship.isMultiResult()).toBe(false);
  });

  it('should handle alias in embed request', () => {
    const embedRequest = {
      table: 'author',
      alias: 'writer',
      fields: ['name', 'email'],
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.as).toBe('writer');
  });
});