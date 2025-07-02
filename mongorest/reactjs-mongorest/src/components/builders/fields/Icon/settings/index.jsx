import IconDefault from './IconDefault';

const setting = {
  icon: {
    displayName: 'Icon',
    matchIf: [
      {
        types: ['string'],
        widget: 'icon',
      },
    ],
    defaultDataSchema: {
      widget: 'icon',
    },
    defaultUiSchema: {
      'ui:widget': 'icon',
    },
    type: 'string',
    cardBody: IconDefault,
    modalBody: () => {},
  },
};

export default setting;
