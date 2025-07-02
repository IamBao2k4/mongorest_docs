import { formatData, formatToDisplay } from '@/helpers/formatReturnData';
import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const choose = [
  {
    label: 'Vertical',
    value: 0,
    key: 'vertical',
  },
  {
    label: 'Horizontal',
    value: 1,
    key: 'horizontal',
  },
];

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
    title: 'Select All',
    typeField: 'boolean',
    key: 'toggleAll',
  },
  {
    title: 'Layouts',
    typeField: 'choose',
    key: 'layout',
    choose: choose,
  },
];

const CheckboxSetting = (props) => {
  const { onChange, parameters } = props;

  return (
    <div className='grid grid-cols-2 gap-5'>
      {arraySettings.map((item, index) => (
        <div
          key={index}
          className='col-span-1'>
          <WrapperSetting
            title={item.title}
            typeField={item.typeField}
            value={item.key === 'choices' ? undefined : parameters[`${item.key}`]}
            optionsLevel1={item.options}
            checked={item.key === 'allowNull' ? parameters?.allowNull : parameters?.toggleAll}
            onCheckedChange={(val) => {
              if (item.key === 'allowNull') {
                onChange({ ...parameters, allowNull: val });
              } else {
                onChange({ ...parameters, toggleAll: val });
              }
            }}
            description={item.description}
            choose={item.choose}
            placeholder={item.placeholder}
            defaultValue={
              item.key === 'choices'
                ? formatToDisplay(parameters?.choices, parameters?.returnValue) || ''
                : parameters?.default || ''
            }
            onChange={(val) => {
              switch (item.key) {
                case 'choices':
                  return onChange({
                    ...parameters,
                    choices: formatData(val.target.value, parameters?.returnValue),
                  });

                case 'layout':
                  return onChange({
                    ...parameters,
                    layout: val, // Update this line
                  });

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

export default CheckboxSetting;
