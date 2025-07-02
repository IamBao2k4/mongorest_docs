import { WrapperField } from '@/components/builders/elements';
import _ from 'lodash';
import { NumberInputTable } from './components';
import { Input } from '@/components/ui/Input';

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
  return (
    <div
      id={id}
      style={{ width: '100%' }}>
      {type === 'table' ? <NumberInputTable value={value} /> : null}
      {type === 'edit' ? (
        <WrapperField
          title={label}
          required={required}
          description={schema?.description}
          error={error}>
          <Input
            type='number'
            placeholder={props?.placeholder}
            disabled={schema?.isDisable}
            value={value}
            autoComplete={props?.options?.autocomplete}
            style={{ width: '100%', borderRadius: 5.375 }}
            max={schema?.max ? schema?.max : null}
            min={schema?.min ? schema?.min : null}
            onChange={(e) => {
              e.target.value && onChange(parseInt(e.target.value));
            }}
          />
        </WrapperField>
      ) : null}

      {type === 'filter' ? (
        <>
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
        </>
      ) : null}
    </div>
  );
};

export default Number;
