import React from 'react';
import { BooleanEdit, BooleanFilter, BooleanTable } from './components';

const BooleanCustom = ({
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
  onClick = () => {},
  ...props
}) => {
  return (
    <div>
      {type === 'edit' && (
        <>
          <BooleanEdit
            defaultChecked={schema?.default}
            typeBoolean={schema?.appearance}
            onChange={onChange}
            checked={value ? value : false}
            disabled={schema?.isDisable}
            title={label}
            required={required || schema?.required}
            description={schema?.description}
          />
        </>
      )}

      {type === 'filter' && (
        <>
          <BooleanFilter
            defaultChecked={schema?.default}
            onChange={onChange}
            checked={value ? value : false}
            disabled={disabled}
          />
        </>
      )}

      {type === 'table' && schema.key && (
        <BooleanTable
          key={schema.key}
          value={value}
        />
      )}
    </div>
  );
};
export default BooleanCustom;
