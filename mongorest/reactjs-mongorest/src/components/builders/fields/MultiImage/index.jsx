import React from 'react';
import _ from 'lodash';
import {MultiImageEdit, MultiImageFilter, MultiImageTable} from './components';

const MultiImageUpload = ({
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
        <MultiImageEdit
          id={id}
          schema={schema}
          required={required}
          onChange={onChange}
          props={props}
          value={value}
        />
      ) : null}

      {type === 'filter' ? <MultiImageFilter onChange={onChange} /> : null}

      {type === 'table' && value ? (
        <MultiImageTable
          onClick={onClick}
          href={schema.href}
          alt={value.alt ? value.alt : value ? value : ''}
          path={value.path ? value.path : value ? value : ''}
        />
      ) : null}
    </>
  );
};
export default MultiImageUpload;
