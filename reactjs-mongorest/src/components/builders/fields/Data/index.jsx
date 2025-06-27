import { TextLabel } from '@/components/builders/elements';
import { Fragment } from 'react';
import { DataEdit } from './components';

const Data = ({ schema, options, required, onChange, value, type = 'edit' }) => {
  return (
    <Fragment>
      <TextLabel
        required={required}
        {...schema}
      />
      <DataEdit
        value={value || {}}
        onChange={onChange}
        schema={schema}
      />
    </Fragment>
  );
};

export default Data;
