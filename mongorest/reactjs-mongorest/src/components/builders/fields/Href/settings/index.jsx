import HrefDefault from './HrefDefault';
import HrefSetting from './HrefSetting';

const setting = {
  href: {
    displayName: 'Href',
    matchIf: [
      {
        types: ['string'],
        widget: 'href',
      },
    ],
    defaultDataSchema: {
      widget: 'href',
    },
    defaultUiSchema: {
      'ui:widget': 'href',
    },
    type: 'string',
    cardBody: HrefDefault,
    modalBody: HrefSetting,
  },
};

export default setting;
