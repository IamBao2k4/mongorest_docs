import { RETURN_TYPE } from '@/data/enum';
import CheckboxSetting from './CheckboxSetting';

const setting = {
  checkbox: {
    displayName: 'Checkbox',
    matchIf: [
      {
        types: ['string'],
        widget: 'checkbox',
      },
    ],
    defaultDataSchema: {
      widget: 'checkbox',
      choices: [],
      default: [],
      allowCustom: false,
      returnValue: RETURN_TYPE.both,
      layout: 0,
      toggleAll: false,
    },
    defaultUiSchema: { 'ui:widget': 'checkbox' },
    type: 'string',
    cardBody: () => <></>,
    modalBody: CheckboxSetting,
  },
};

export default setting;
