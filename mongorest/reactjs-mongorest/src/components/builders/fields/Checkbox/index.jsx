import { CheckBoxEdit } from './components';

function Checkbox({ id, schema, onChange, value, type = 'edit', ...props }) {
  return (
    <>
      {type === 'edit' && (
        <>
          <CheckBoxEdit
            id={id}
            onChange={onChange}
            schema={schema}
            value={value}
            {...props}
          />
        </>
      )}
    </>
  );
}

export default Checkbox;
