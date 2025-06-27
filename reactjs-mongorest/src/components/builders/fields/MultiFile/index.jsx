import {MultiFileEdit, MultiFileFilter, MultiFileTable} from './components';

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
        <MultiFileEdit
          id={id}
          schema={schema}
          required={required}
          onChange={onChange}
          props={props}
          value={value}
        />
      ) : null}

      {type === 'filter' ? <MultiFileFilter onChange={onChange} /> : null}

      {type === 'table' && value ? (
        <MultiFileTable onClick={onClick} value={value} />
      ) : null}
    </>
  );
};
export default FileUpload;
