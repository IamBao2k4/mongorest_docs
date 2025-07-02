import Builder from './Builder';
import { DEFAULT_FORM_FE } from '../fields/default';

function FormBuilder({ schema, uischema, onChange }) {
  return (
    <Builder
      schema={schema}
      uischema={uischema}
      onChange={onChange}
      fields={DEFAULT_FORM_FE}
      type='form'
    />
  );
}

export default FormBuilder;
