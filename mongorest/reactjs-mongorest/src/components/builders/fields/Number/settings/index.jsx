import NumberInputDefault from './NumberInputDefault';
import NumberInputSetting from './NumberInputSetting';

const setting = {
  number: {
    displayName: 'Number',
    matchIf: [
      {
        types: ['string'],
        widget: 'numberInput',
      },
    ],
    defaultDataSchema: {
      widget: 'numberInput',
    },
    defaultUiSchema: {
      'ui:widget': 'numberInput',
    },
    type: 'string',
    cardBody: NumberInputDefault,
    modalBody: NumberInputSetting,
  },
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
    cardBody: NumberInputDefault,
    modalBody: NumberInputSetting,
  },
};

export default setting;