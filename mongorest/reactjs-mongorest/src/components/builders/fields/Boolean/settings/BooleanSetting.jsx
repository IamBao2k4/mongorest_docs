import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import { ENUM_TYPE_BOOLEAN } from '@/data/enum';

const options = [
  {
    label: 'Switch',
    value: ENUM_TYPE_BOOLEAN.switch,
    key: ENUM_TYPE_BOOLEAN.switch,
  },
  {
    label: 'Checkbox',
    value: ENUM_TYPE_BOOLEAN.checkbox,
    key: ENUM_TYPE_BOOLEAN.checkbox,
  },
];

const arraySettings = [
  {
    title: 'Default Value',
    typeField: 'boolean',
    key: 'default',
  },
  {
    title: 'Appearance',
    optionsLevel1: options,
    key: 'appearance',
    description: 'Select the appearance of this field',
  },
];

const BooleanSetting = ({ parameters, onChange }) => {
  return (
    <div className='grid grid-cols-2 gap-5'>
      {arraySettings.map((item, index) => (
        <div
          key={index}
          className='col-span-1'>
          <WrapperSetting
            title={item.title}
            description={item.description}
            typeField={item.typeField}
            value={parameters[item.key] ? parameters[item.key] : ''}
            checked={item.key === 'default' ? parameters.default : ''}
            onCheckedChange={(val) => {
              if (item.key === 'default') {
                onChange({ ...parameters, default: val });
              }
            }}
            optionsLevel1={item.optionsLevel1}
            onChange={(val) => {
              switch (item.key) {
                case 'appearance':
                  return onChange({ ...parameters, appearance: val });
                default:
                  return onChange({ ...parameters, [item.key]: val.target.value });
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default BooleanSetting;
