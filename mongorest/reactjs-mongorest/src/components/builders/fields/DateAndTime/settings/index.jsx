import DateAndTimeDefault from './DateAndTimeDefault';
import DateAndTimeSetting from './DateAndTimeSetting';

const dateTimeInputs = {
  dateTime: {
    displayName: 'Date-Time',
    matchIf: [
      {
        types: ['string'],
        formatDate: 'date-time',
        widget: 'dateTime',
      },
    ],
    defaultDataSchema: {
      formatDate: 'date-time',
      widget: 'dateTime',
      displayFormat: 'YYYY/MM/DD : HH:mm',
    },
    defaultUiSchema: {'ui:widget': 'dateTime'},
    type: 'string',
    cardBody: DateAndTimeDefault,
    modalBody: DateAndTimeSetting,
  },
  date: {
    displayName: 'Date',
    matchIf: [
      {
        types: ['string'],
        formatDate: 'date',
        widget: 'date',
      },
    ],
    type: 'string',

    defaultDataSchema: {
      widget: 'date',
      formatDate: 'date',
      displayFormat: 'YYYY/MM/DD',
    },
    defaultUiSchema: {'ui:widget': 'date'},
    cardBody: DateAndTimeDefault,
    modalBody: DateAndTimeSetting,
  },
  time: {
    displayName: 'Time',
    matchIf: [
      {
        types: ['string'],
        formatDate: 'time',
        widget: 'time',
      },
    ],
    defaultDataSchema: {
      formatDate: 'time',
      displayFormat: 'HH:mm:ss',
      widget: 'time',
    },
    defaultUiSchema: {'ui:widget': 'time'},

    type: 'string',
    cardBody: DateAndTimeDefault,
    modalBody: DateAndTimeSetting,
  },
};

export default dateTimeInputs;
