import { TextLabel } from '@/components/builders/elements';
import { RadioEdit } from './components';

function Radio({ id, schema, onChange, value, type = 'edit', required, ...props }) {
  return (
    <>
      {type === 'edit' && (
        <>
          {type !== 'filter' ? (
            <TextLabel
              title={schema?.title}
              required={required}
            />
          ) : null}
          <RadioEdit
            onChange={onChange}
            schema={schema}
            {...props}
          />
        </>
      )}
    </>
  );
}

export default Radio;
