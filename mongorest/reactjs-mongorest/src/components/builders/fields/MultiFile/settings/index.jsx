import MultiFileDefault from './MultiFileDefault';
import MultiFileSetting from './MultiFileSetting';

const setting = {
  multipleFiles: {
    displayName: 'Multiple Images',
    matchIf: [
      {
        types: ['string'],
        library_setting: 'all',
        widget: 'multipleFiles',
      },
    ],
    defaultDataSchema: {
      type: 'string',
      library_setting: 'all',
      widget: 'multipleFiles',
    },
    defaultUiSchema: {
      'ui:widget': 'multipleFiles',
    },
    type: 'string',
    cardBody: MultiFileDefault,
    modalBody: MultiFileSetting,
  },
};

export default setting;
