import PasswordDefault from './PasswordDefault';
import ShortAnswerDefault from './ShortAnswerDefault';
import ShortAnswerSetting from './ShortAnswerSetting';

const setting = {
  shortAnswer: {
    displayName: 'Short Answer',
    matchIf: [
      {
        types: ['string'],
        widget: 'shortAnswer',
      },
      ...['email', 'hostname', 'uri', 'regex'].map(format => ({
        types: ['string'],
        format,
        widget: 'shortAnswer',
      })),
    ],
    defaultDataSchema: {
      widget: 'shortAnswer',
    },
    defaultUiSchema: {
      'ui:widget': 'shortAnswer',
    },
    type: 'string',
    cardBody: ShortAnswerDefault,
    modalBody: ShortAnswerSetting,
  },
  password: {
    displayName: 'Password',
    matchIf: [
      {
        types: ['string'],
        widget: 'password',
      },
    ],
    defaultDataSchema: {
      widget: 'password',
    },
    defaultUiSchema: {
      'ui:widget': 'password',
    },
    type: 'string',
    cardBody: PasswordDefault ,
    modalBody: ShortAnswerSetting,
  },
};

export default setting;
