import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const formatDictionary = [
  {
    label: 'Textarea',
    value: 'textarea',
  },
  {
    label: 'Texteditor',
    value: 'texteditor',
  },
];

const arraySettings = [
  {
    title: 'Type',
    options: formatDictionary,
    key: 'customRole',
    description: 'Require string input to match a certain common format',
  },
  {
    title: 'Row',
    typeField: 'number',
    key: 'row',
    description: 'Sets the textarea height',
  },
  {
    title: 'Minimum Length',
    typeField: 'number',
    key: 'min',
  },
  {
    title: 'Maximum Length',
    typeField: 'number',
    key: 'max',
  },
  {
    title: 'Regular Pattern',
    typeField: 'input',
    key: 'pattern',
    description: 'Regular expression pattern that this must satisfy',
  },
  {
    title: 'Placeholder Text',
    typeField: 'input',
    key: 'placeholder',
    description: 'Hint to the user as to what kind of information is expected in the field',
  },
];
function LongAnswerSetting({ parameters, onChange }) {
  return (
    <div className='grid grid-cols-2 gap-5'>
      {arraySettings.map((item, index) => (
        <div
          key={index}
          className='col-span-1'
          span={12}>
          {((item.key === 'min' || item.key === 'max' || item.key === 'row') &&
            parameters.customRole === 'textarea') ||
          (item.key !== 'min' && item.key !== 'max' && item.key !== 'row') ? (
            <WrapperSetting
              title={item.title}
              typeField={item.typeField}
              value={parameters[item.key] ? parameters[item.key] : ''}
              optionsLevel1={item.options}
              description={item.description}
              onChange={(val) => {
                switch (item.key) {
                  case 'min':
                    return onChange({ ...parameters, min: parseInt(val.target.value, 10) });

                  case 'max':
                    return onChange({ ...parameters, max: parseInt(val.target.value, 10) });

                  case 'row':
                    return onChange({ ...parameters, row: parseInt(val.target.value, 10) });

                  case 'customRole':
                    return onChange({ ...parameters, customRole: val });
                  default:
                    return onChange({ ...parameters, [item.key]: val.target.value });
                }
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default LongAnswerSetting;
