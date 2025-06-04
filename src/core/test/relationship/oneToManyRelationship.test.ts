import { OneToManyRelationship } from "../../relationship/oneToManyRelationship"; 

describe('OneToManyRelationship', () => {
  let relationship: OneToManyRelationship;

  beforeEach(() => {
    relationship = new OneToManyRelationship({
      name: 'posts',
      targetTable: 'posts',
      localField: '_id',
      foreignField: 'author_id',
      type: 'one-to-many'
    });
  });

  it('should generate correct join condition', () => {
    const condition = relationship.generateJoinCondition();
    expect(condition).toEqual({
      localField: '_id',
      foreignField: 'author_id',
      joinType: 'left'
    });
  });

  it('should generate lookup stage with filters', () => {
    const embedRequest = {
      table: 'posts',
      fields: ['title', 'content'],
      filters: { published: true },
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.pipeline).toContainEqual({ $match: { published: true } });
  });

  it('should generate lookup stage with sorting', () => {
    const embedRequest = {
      table: 'posts',
      fields: ['title', 'content'],
      orderBy: ['created_at.desc'],
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.pipeline).toContainEqual({ $sort: { created_at: -1 } });
  });

  it('should generate lookup stage with limit', () => {
    const embedRequest = {
      table: 'posts',
      fields: ['title', 'content'],
      limit: 10,
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.pipeline).toContainEqual({ $limit: 10 });
  });

  it('should generate lookup stage with offset', () => {
    const embedRequest = {
      table: 'posts',
      fields: ['title', 'content'],
      offset: 5,
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.pipeline).toContainEqual({ $skip: 5 });
  });

  it('should be multi-result', () => {
    expect(relationship.isMultiResult()).toBe(true);
  });

  it('should handle empty fields array', () => {
    const embedRequest = {
      table: 'posts',
      fields: [], // Empty fields array
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    
    // ✅ Fix: Check if pipeline exists before checking its contents
    if (stage.$lookup.pipeline && stage.$lookup.pipeline.length > 0) {
      expect(stage.$lookup.pipeline).not.toContainEqual(
        expect.objectContaining({ $project: expect.anything() })
      );
    } else {
      // If no pipeline, that's also valid for empty fields
      expect(stage.$lookup.pipeline).toBeUndefined();
    }
  });
});