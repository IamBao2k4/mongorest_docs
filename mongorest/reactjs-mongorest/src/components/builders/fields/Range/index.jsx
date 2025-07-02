import { WrapperField } from '@/components/builders/elements';
import _ from 'lodash';
import { RangeTable } from './components';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';

const Number = ({
  schema,
  placeholder,
  value,
  required,
  title,
  label,
  onChange,
  type = 'edit',
  id,
  ...props
}) => {
  let error = _.get(props, `formContext.errors[${id}]`);
  const { min = 1, max = 1000, step } = schema;
  return (
    <div
      id={id}
      style={{ width: '100%' }}>
      {type === 'table' ? <RangeTable value={value} /> : null}

      {type === 'edit' ? (
        <WrapperField
          title={label}
          required={required}
          description={schema?.description}
          error={error}>
          <Slider
            min={min}
            max={max}
            step={step}
            value={Array.isArray(value) ? value : [value]}
            onValueChange={onChange}
            className='pt-1'
          />
        </WrapperField>
      ) : null}

      {type === 'filter' ? (
        <Input
          type='number'
          placeholder={props?.placeholder}
          disabled={props.disabled ? props.disabled : false}
          value={value}
          autoComplete={props?.options?.autocomplete}
          style={{ width: '100%', borderRadius: 5.375 }}
          max={schema?.max ? schema?.max : null}
          min={schema?.min ? schema?.min : null}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      ) : null}
    </div>
  );
};

export default Number;
