import Builder from './Builder';
import { DEFAULT_FORM_INPUTS } from '../fields/default';

function JsonBuilder({ schema, uischema, onChange, className = '' }) {
  return (
    <Builder
      className={className}
      schema={schema}
      uischema={uischema}
      onChange={onChange}
      fields={DEFAULT_FORM_INPUTS}
      type='posttype'
    />
  );
}

export default JsonBuilder;
