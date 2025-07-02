import MultiImageDefault from './MultiImageDefault';
import MultiImageSetting from './MultiImageSetting';

const setting = {
  multiImage: {
    displayName: 'Multi Image Responsive',
    matchIf: [
      {
        types: ['string'],
        widget: 'multiImage',
      },
    ],
    defaultDataSchema: {
      type: 'string',
      widget: 'multiImage',
    },
    defaultUiSchema: {
      'ui:widget': 'multiImage',
    },
    type: 'string',
    cardBody: MultiImageDefault,
    modalBody: MultiImageSetting,
  },
};

export default setting;
