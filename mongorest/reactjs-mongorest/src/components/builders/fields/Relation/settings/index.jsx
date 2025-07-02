import { ENUM_TYPE_SELECT_TAG } from '@/data/enum';
import RelationSetting from './RelationSetting';
import RelationDefault from './RelationDefault';

const setting = {
  relation: {
    displayName: 'Relation',
    matchIf: [
      {
        types: ['string'],
        widget: 'relation',
      },
    ],
    defaultDataSchema: {
      type: 'string',
      typeRelation: {
        title: 'all-entity',
        entity: 'entity',
        type: '1-n',
      },
      widget: 'relation',
      typeSelect: ENUM_TYPE_SELECT_TAG.multiple,
    },
    defaultUiSchema: {
      'ui:widget': 'relation',
    },
    type: 'string',
    cardBody: RelationDefault,
    modalBody: RelationSetting,
  },
};

export default setting;
