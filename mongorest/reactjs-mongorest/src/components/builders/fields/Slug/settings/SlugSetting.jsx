import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import { autoDictionary, formatDictionary } from '../../ShortAnswer/settings/ShortAnswerSetting';

export default function SlugSetting({ parameters, onChange }) {
  const arraySettings = [
    {
      title: 'Minimum Length',
      typeField: 'number',
      key: 'minLength',
    },
    {
      title: 'Maximum Length',
      typeField: 'number',
      key: 'maxLength',
      error:
        parameters.minLength && parameters.maxLength && parameters.minLength >= parameters.maxLength
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
    <div>
      <div className='grid grid-cols-2 gap-5'>
        {arraySettings.slice(0, 6).map((item, index) => (
          <div
            key={index}
            className='col-span-1'>
            <WrapperSetting
              title={item.title}
              key={item.key}
              optionsLevel1={item.options}
              typeField={item.typeField}
              value={parameters[`${item.key}`]}
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
      <div className='flex gap-2 pt-5'>
        {arraySettings.slice(6).map((item, index) => (
          <div
            key={index}
            className='gutter-row w-1/2'>
            <WrapperSetting
              title={item.title}
              typeField={item.typeField}
              checked={item.key === 'autofocus' ? parameters.autofocus : ''}
              onCheckedChange={(val) => {
                if (item.key === 'autofocus') {
                  onChange({ ...parameters, autofocus: val });
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
