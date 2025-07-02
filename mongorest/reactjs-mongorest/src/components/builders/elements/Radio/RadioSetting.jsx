import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';

const RadioSetting = ({ value, onChange = () => {}, schema, ...props }) => {
  const { choices, allowNull, allowCustom } = schema;

  return (
    <RadioGroup
      onValueChange={(value) => onChange(value)}
      value={value}>
      {allowNull && (
        <div className='flex items-center space-x-2 w-1/3'>
          <RadioGroupItem
            value=''
            id='null'
          />
          <Label htmlFor='null'></Label>
        </div>
      )}
      {choices?.map?.((item, index) => (
        <div
          className='flex items-center space-x-2 w-1/3'
          key={index}>
          <RadioGroupItem
            value={item?.value}
            id={item?.value}
          />
          <Label htmlFor={item?.value}>{item?.label}</Label>
        </div>
      ))}

      {allowCustom && (
        <div
          className='flex items-center space-x-2 w-1/3'
          key={index}>
          <RadioGroupItem value={-1} />
          More...
          {value === -1 ? (
            <Input
              style={{ width: 100 }}
              onBlur={(e) => onChange(e.target.value)}
            />
          ) : null}
        </div>
      )}
    </RadioGroup>
  );
};
export default RadioSetting;
