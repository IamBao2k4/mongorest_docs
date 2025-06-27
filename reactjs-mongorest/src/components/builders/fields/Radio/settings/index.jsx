import { RETURN_TYPE } from '@/data/enum';
import RadioSetting from './RadioSetting';
import RadioDefault from './RadioDefault';

const setting = {
  radio: {
    displayName: 'Radio',
    matchIf: [
      {
        types: ['string', 'number', 'integer', 'array', 'boolean', 'null'],
        widget: 'radio',
      },
    ],
    defaultDataSchema: {
      widget: 'radio',
      layout: 0,
      returnValue: RETURN_TYPE.both,
      allowNull: false,
      allowCustom: false,
    },
    defaultUiSchema: {
      'ui:widget': 'radio',
    },
    type: 'boolean',
    cardBody: RadioDefault,
    modalBody: RadioSetting,
  },
};

export default setting;
