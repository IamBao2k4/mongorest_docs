import BreakSetting from '../BreakSetting';

const setting = {
  break: {
    displayName: 'Break',
    matchIf: [
      {
        types: ['string'],
        widget: 'break',
      },
    ],
    defaultDataSchema: {
      widget: 'break',
    },
    defaultUiSchema: {
      'ui:widget': 'break',
    },
    type: 'string',
    cardBody: () => {},
    modalBody: BreakSetting,
  },
};

export default setting;
