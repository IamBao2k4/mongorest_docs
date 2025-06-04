import { OneToOneRelationship } from "../../relationship/oneToOneRelationship"; 

describe('OneToOneRelationship', () => {
  let relationship: OneToOneRelationship;

  beforeEach(() => {
    relationship = new OneToOneRelationship({
      name: 'profile',
      targetTable: 'user_profiles',
      localField: '_id',
      foreignField: 'user_id',
      type: 'one-to-one'
    });
  });

  it('should generate correct join condition', () => {
    const condition = relationship.generateJoinCondition();
    expect(condition).toEqual({
      localField: '_id',
      foreignField: 'user_id',
      joinType: 'left'
    });
  });

  it('should generate lookup stage with fields', () => {
    const embedRequest = {
      table: 'profile',
      fields: ['avatar', 'bio'],
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.from).toBe('user_profiles');
    expect(stage.$lookup.localField).toBe('_id');
    expect(stage.$lookup.foreignField).toBe('user_id');
    expect(stage.$lookup.as).toBe('profile');
  });

  it('should generate lookup stage with pipeline for specific fields', () => {
    const embedRequest = {
      table: 'profile',
      fields: ['avatar', 'bio'],
      joinHint: 'left'
    };

    const stage = relationship.generateLookupStage(embedRequest);
    expect(stage.$lookup.pipeline).toEqual([
      {
        $project: {
          avatar: 1,
          bio: 1
        }
      }
    ]);
  });

  it('should not be multi-result', () => {
    expect(relationship.isMultiResult()).toBe(false);
  });

  it('should validate successfully', () => {
    expect(relationship.validate()).toBe(true);
  });

  it('should have correct getters', () => {
    expect(relationship.name).toBe('profile');
    expect(relationship.targetTable).toBe('user_profiles');
    expect(relationship.localField).toBe('_id');
    expect(relationship.foreignField).toBe('user_id');
    expect(relationship.type).toBe('one-to-one');
  });
});
