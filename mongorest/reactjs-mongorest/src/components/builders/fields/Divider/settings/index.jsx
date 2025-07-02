const setting = {
  divider: {
    displayName: 'Divider',
    matchIf: [
      {
        types: ['string'],
        widget: 'divider',
      },
    ],
    defaultDataSchema: {
      widget: 'divider',
    },
    defaultUiSchema: {
      'ui:widget': 'divider',
    },
    type: 'string',
    cardBody: () => {},
    modalBody: () => {},
  },
};

export default setting;
