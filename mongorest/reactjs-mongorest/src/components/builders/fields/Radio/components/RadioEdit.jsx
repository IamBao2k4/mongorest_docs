import { WrapperField } from '@/components/builders/elements';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import clsx from 'clsx';
import { useState } from 'react';

const RadioEdit = ({ schema, required, onChange }) => {
  const [check, setCheck] = useState(schema?.default || -1);

  const onCheck = (value) => {
    onChange?.(typeof value === 'string' ? value : JSON.stringify(value));
    setCheck(value);
  };

  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={required}>
      <RadioGroup
        disabled={schema?.isDisable}
        onValueChange={(value) => onCheck(value)}
        value={check}>
        <div className={clsx('flex gap-2', schema?.layout ? 'flex-row' : 'flex-col')}>
          {schema?.allowNull && (
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value=''
                id='null'
              />
              <Label htmlFor='null'></Label>
            </div>
          )}
          {schema?.choices?.map?.((item, index) => (
            <div
              className='flex items-center space-x-2'
              key={item?.value}>
              <RadioGroupItem
                key={item?.value}
                value={item?.value}
                id={item?.value}
              />
              <Label htmlFor={item?.value}>{item?.key}</Label>
            </div>
          ))}

          {schema?.allowCustom && (
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={-1} />
              <>
                More...
                <Input
                  style={{ width: 100, marginLeft: 10 }}
                  disabled={check !== -1}
                  onBlur={(e) => onCheck(e.target.value)}
                />
              </>
            </div>
          )}
        </div>
      </RadioGroup>
    </WrapperField>
  );
};
export default RadioEdit;
