import { RETURN_TYPE } from '@/data/enum';
import SelectDefault from './SelectDefault';
import SelectSetting from './SelectSetting';

const setting = {
  select: {
    displayName: 'Select',
    matchIf: [
      {
        types: ['string', 'number', 'integer', 'array', 'boolean', 'null'],
        widget: 'select',
      },
    ],
    defaultDataSchema: {
      widget: 'select',
      returnValue: RETURN_TYPE.both,
      choices: [],
      default: [],
      allowNull: false,
      isMultiple: false,
    },
    defaultUiSchema: {
      'ui:widget': 'select',
    },
    type: 'string',
    cardBody: SelectDefault,
    modalBody: SelectSetting,
  },
};

export default setting;
