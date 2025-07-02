import WrapperSetting from '@/components/builders/elements/WrapperSetting';

export const autoDictionary = [
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Telephone',
    value: 'tel',
  },
  {
    label: 'User Name',
    value: 'username',
  },
  {
    label: 'Password',
    value: 'password',
  },
  {
    label: 'Street Address',
    value: 'street-address',
  },
  {
    label: 'Country',
    value: 'country',
  },
  {
    label: 'Honorific Prefix',
    value: 'honorific-prefix',
  },
  {
    label: 'Given Name',
    value: 'given-name',
  },
  {
    label: 'Family Name',
    value: 'family-name',
  },
  {
    label: 'Nickname',
    value: 'nickname',
  },
  {
    label: 'Organization Title',
    value: 'organization-title',
  },
  {
    label: 'Organization',
    value: 'organization',
  },
  {
    label: 'Address Line 1',
    value: 'address-line1',
  },
  {
    label: 'Address Line 2',
    value: 'address-line2',
  },
  {
    label: 'Address Line 3',
    value: 'address-line3',
  },
  {
    label: 'Address Level 1',
    value: 'address-level1',
  },
  {
    label: 'Address Level 2',
    value: 'address-level2',
  },
  {
    label: 'Address Level 3',
    value: 'address-level3',
  },
  {
    label: 'Address Level 4',
    value: 'address-level4',
  },
  {
    label: 'Country Name',
    value: 'country-name',
  },
  {
    label: 'Postal Code',
    value: 'postal-code',
  },
  {
    label: 'Credit Card Name',
    value: 'cc-name',
  },
  {
    label: 'Credit Card Number',
    value: 'cc-number',
  },
  {
    label: 'Credit Card Expiration Date',
    value: 'cc-exp',
  },
  {
    label: 'Credit Card Type',
    value: 'cc-type',
  },
  {
    label: 'Language',
    value: 'language',
  },
  {
    label: 'Birth Date',
    value: 'bday',
  },
];

export const formatDictionary = [
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Phone',
    value: 'phone',
  },
];

function ShortAnswerSetting({ parameters, onChange }) {
  const arraySettings = [
    {
      title: 'Minimum Length',
      typeField: 'number',
      key: 'min',
    },
    {
      title: 'Maximum Length',
      typeField: 'number',
      key: 'max',
      error:
        parameters.min && parameters.max && parameters.min >= parameters.max
          ? 'Maximum must smaller than minimum'
          : '',
    },
    {
      title: 'Regular',
      typeField: 'input',
      key: 'pattern',
    },

    {
      title: 'Placeholder',
      typeField: 'input',
      key: 'placeholder',
    },
    {
      title: 'Auto Complete',
      options: autoDictionary,
      key: 'autocomplete',
    },
    {
      title: 'Format',
      options: formatDictionary,
      key: 'format-data',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-5'>
      {arraySettings.map((item, index) => (
        <div key={index}>
          <WrapperSetting
            title={item.title}
            typeField={item.typeField}
            value={parameters[`${item.key}`] ? parameters[`${item.key}`] : ''}
            optionsLevel1={item.options}
            error={item.error}
            onChange={(val) => {
              switch (item.key) {
                case 'min':
                  return onChange({ ...parameters, min: parseInt(val.target.value, 10) });

                case 'max':
                  return onChange({ ...parameters, max: parseInt(val.target.value, 10) });

                case 'autocomplete':
                  return onChange({ ...parameters, autocomplete: val });

                case 'format-data':
                  return onChange({ ...parameters, 'format-data': val });
                default:
                  return onChange({ ...parameters, [item.key]: val.target.value });
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default ShortAnswerSetting;
