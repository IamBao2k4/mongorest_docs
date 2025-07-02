import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import { formatData, formatToDisplay } from '@/helpers/formatReturnData';

const arraySettings = [
  {
    title: 'Choices',
    key: 'choices',
    description:
      'Enter each choice on a new line. For more control, you may specify both a value and label like this: red:Red',
    placeholder: `label1:value1\nlabel2:value2`,
    typeField: 'textarea',
  },
  {
    title: 'Default Value',
    typeField: 'textarea',
    placeholder: 'value1',
    key: 'default',
    description: 'Enter each choice on a new line',
  },
  {
    title: 'Allow null',
    typeField: 'boolean',
    key: 'allowNull',
  },
  {
    title: 'Select multiple values',
    typeField: 'boolean',
    key: 'isMultiple',
  },
];

const SelectSetting = ({ onChange, parameters }) => {
  return (
    <div>
      <div className='grid grid-cols-2 gap-5'>
        {arraySettings.map((item, index) => (
          <div
            key={index}
            className='col-span-1'>
            <WrapperSetting
              title={item.title}
              typeField={item.typeField}
              value={item.key === 'choices' ? undefined : parameters[`${item.key}`]}
              defaultValue={
                item.key === 'choices'
                  ? formatToDisplay(parameters?.choices, parameters?.returnValue) || ''
                  : parameters[`${item.key}`]
              }
              checked={item.key === 'allowNull' ? parameters?.allowNull : parameters?.isMultiple}
              onCheckedChange={(val) => {
                if (item.key === 'allowNull') {
                  return onChange({ ...parameters, allowNull: val });
                } else {
                  onChange({ ...parameters, isMultiple: val });
                }
              }}
              placeholder={item.placeholder}
              onChange={(val) => {
                if (item.key === 'choices') {
                  return onChange({
                    ...parameters,
                    choices: formatData(val.target.value, parameters?.returnValue),
                  });
                } else {
                  return onChange({ ...parameters, [item.key]: val.target.value });
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default SelectSetting;
