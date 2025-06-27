import SlugDefault from './SlugDefault';
import SlugSetting from './SlugSetting';

const setting = {
  autoGenKeyFromAnotherField: {
    displayName: 'Slug',
    matchIf: [
      {
        types: ['string'],
        widget: 'UriKeyGen',
      },
      {
        types: ['string'],
        widget: 'autoGenKeyFromAnotherField',
      },
    ],
    defaultDataSchema: { widget: 'UriKeyGen' },
    defaultUiSchema: {
      'ui:widget': 'UriKeyGen',
    },
    type: 'string',
    cardBody: SlugDefault,
    modalBody: SlugSetting,
  },
};

export default setting;
