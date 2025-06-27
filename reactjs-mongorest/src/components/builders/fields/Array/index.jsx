import React from 'react';
import { ArrayEdit, ArrayFilter, ArrayTable } from './components';

const ArrayCustom = ({
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
        <ArrayEdit
          defaultChecked={schema?.default}
          typeBoolean={schema?.appearance}
          onChange={onChange}
          value={value}
          disabled={disabled}
          title={label}
          required={required || schema?.required}
          description={schema?.description}
          id={id}
          {...props}
        />
      )}

      {type === 'filter' && (
        <ArrayFilter
          defaultChecked={schema?.default}
          onChange={onChange}
          checked={value ? value : false}
          disabled={disabled}
        />
      )}

      {type === 'table' && schema.key && (
        <ArrayTable
          key={schema.key}
          value={value}
        />
      )}
    </div>
  );
};
export default ArrayCustom;
