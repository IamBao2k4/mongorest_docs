import RangeDefault from './RangeDefault';
import RangeSetting from './RangeSetting';

const setting = {
  range: {
    displayName: 'Range',
    matchIf: [
      {
        types: ['string'],
        widget: 'range',
      },
    ],
    defaultDataSchema: {
      widget: 'range',
    },
    defaultUiSchema: {
      'ui:widget': 'range',
    },
    type: 'string',
    cardBody: RangeDefault,
    modalBody: RangeSetting,
  },
};

export default setting;
