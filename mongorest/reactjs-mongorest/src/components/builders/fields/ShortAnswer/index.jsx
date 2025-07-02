import { WrapperField } from '@/components/builders/elements';
import _ from 'lodash';
import { Fragment } from 'react';
import { ShortAnswerEdit, ShortAnswerFilter, ShortAnswerTable } from './components';

const ShortAnswer = ({
  id,
  isFilter,
  schema,
  disabled = false,
  options,
  required,
  onChange,
  label,
  width,
  value,
  type = 'edit',
  isPined,
  onClick,
  ...props
}) => {
  let error = _.get(props, `formContext.errors[${id}]`);
  return (
    <Fragment>
      {type === 'edit' && (
        <WrapperField
          showLabel={type !== 'filter'}
          title={label}
          required={required || schema?.required}
          description={schema?.description}
          error={error}>
          <ShortAnswerEdit
            id={id}
            placeholder={schema?.placeholder}
            disabled={schema?.isDisable}
            onChange={onChange}
            width={width}
            value={value ? value : ''}
            minLength={schema?.min}
            maxLength={schema?.max}
            regex={schema?.regex}
            widget={schema.widget}
            autocomplete={options?.autocomplete}
          />
        </WrapperField>
      )}

      {type === 'filter' && (
        <ShortAnswerFilter
          id={id}
          placeholder={schema?.placeholder}
          disabled={schema?.isDisable}
          onChange={onChange}
          width={width}
          value={value}
          minLength={schema?.min}
          maxLength={schema?.max}
          regex={schema?.regex}
          widget={schema.widget}
          autocomplete={options?.autocomplete}
        />
      )}

      {type === 'table' && schema.key && (
        <ShortAnswerTable
          isPined={isPined}
          onClick={onClick}
          keyName={schema.key}
          href={schema.href}
          value={value}
          key={schema?.key}
        />
      )}
    </Fragment>
  );
};
export default ShortAnswer;
