import DataDefault from './DataDefault';
import DataSetting from './DataSetting';

const setting = {
  dataWidget: {
    displayName: 'Data',
    matchIf: [
      {
        types: ['string'],
        widget: 'dataWidget',
      },
    ],
    defaultDataSchema: { widget: 'dataWidget' },
    defaultUiSchema: {
      'ui:widget': 'dataWidget',
    },
    type: 'string',
    cardBody: DataDefault,
    modalBody: DataSetting,
  },
};

export default setting;
