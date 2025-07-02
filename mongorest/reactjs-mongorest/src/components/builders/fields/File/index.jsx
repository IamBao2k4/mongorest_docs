import React from 'react';
import _ from 'lodash';
import { FileEdit, FileFilter, FileTable } from './components';

const FileUpload = ({
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
        <FileEdit
          id={id}
          schema={schema}
          required={required}
          onChange={onChange}
          props={props}
          value={value}
        />
      ) : null}

      {type === 'filter' ? <FileFilter onChange={onChange} /> : null}

      {type === 'table' && value ? (
        <FileTable
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
export default FileUpload;
