import ConditionSetting from './ConditionSetting';

const setting = {
  condition: {
    displayName: 'Condition',
    matchIf: [
      {
        types: ['string'],
        widget: 'condition',
      },
    ],
    defaultDataSchema: {
      type: 'string',
      widget: 'condition',
    },
    defaultUiSchema: {
      'ui:widget': 'condition',
    },
    type: 'string',
    cardBody: () => <></>,
    modalBody: ConditionSetting,
  },
};

export default setting;
