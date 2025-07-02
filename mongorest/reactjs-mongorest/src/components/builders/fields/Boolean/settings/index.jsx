import { ENUM_TYPE_BOOLEAN } from '@/data/enum';
import BooleanDefault from './BooleanDefault';
import BooleanSetting from './BooleanSetting';

const setting = {
  boolean: {
    displayName: 'True/False',
    matchIf: [
      {
        types: ['boolean', 'string'],
        widget: 'boolean',
      },
    ],
    defaultDataSchema: {
      widget: 'boolean',
      default: false,
      appearance: ENUM_TYPE_BOOLEAN.switch,
    },
    defaultUiSchema: { 'ui:widget': 'boolean' },
    type: 'boolean',

    cardBody: BooleanDefault,
    modalBody: BooleanSetting,
  },
};

export default setting;
