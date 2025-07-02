import LongAnswerDefault from './LongAnswerDefault';
import LongAnswerSetting from './LongAnswerSetting';

const setting = {
  longAnswer: {
    displayName: 'Long Answer',
    matchIf: [
      {
        types: ['string'],
        widget: 'textarea',
      },
      {
        types: ['string'],
        widget: 'longAnswer',
      },
    ],
    defaultDataSchema: {
      widget: 'longAnswer',
      customRole: 'textarea',
    },
    defaultUiSchema: {
      'ui:widget': 'longAnswer',
    },
    type: 'string',
    cardBody: LongAnswerDefault,
    modalBody: LongAnswerSetting,
  },
};

export default setting;
