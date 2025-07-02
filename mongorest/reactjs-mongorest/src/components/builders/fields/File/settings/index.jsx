import FileDefault from "./FileDefault";
import FileSetting from "./FileSetting";

const setting = {
  file: {
    displayName: 'Single Image',
    matchIf: [
      {
        types: ['string'],
        widget: 'file',
      },
    ],
    defaultDataSchema: {
      type: 'string',
      widget: 'file',
    },
    defaultUiSchema: {
      'ui:widget': 'file',
    },
    type: 'object',
    cardBody: FileDefault,
    modalBody: FileSetting,
  },
};

export default setting;
