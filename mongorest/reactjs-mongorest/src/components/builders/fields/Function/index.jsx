import React from 'react';
import _ from 'lodash';
import { FunctionEdit, FunctionFilter, FunctionTable } from './components';

const Function = ({
  id,
  value,
  type = 'edit',
  schema,
  required,
  onChange,
  onClick = () => {},
  ...props
}) => {
  return (
    <>
      {type === 'edit' ? (
        <FunctionEdit
          id={id}
          schema={schema}
          required={required}
          onChange={onChange}
          props={props}
          value={value}
        />
      ) : null}

      {type === 'filter' ? <FunctionFilter onChange={onChange} /> : null}

      {type === 'table' && value ? (
        <FunctionTable
          onClick={onClick}
          href={schema.href}
          alt={value.alt ? value.alt : value ? value : ''}
          path={value.path ? value.path : value ? value : ''}
          {...props}
        />
      ) : null}
    </>
  );
};
export default Function;
