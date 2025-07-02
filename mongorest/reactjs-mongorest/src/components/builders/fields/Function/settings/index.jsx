import FunctionDefault from './FunctionDefault';
import FunctionSetting from './FunctionSetting';

const setting = {
  function: {
    displayName: 'Function',
    matchIf: [
      {
        types: ['string'],
        widget: 'function',
      },
    ],
    defaultDataSchema: {
      type: 'string',
      widget: 'function',
    },
    defaultUiSchema: {
      'ui:widget': 'function',
    },
    type: 'object',
    cardBody: FunctionDefault,
    modalBody: FunctionSetting,
  },
};

export default setting;
