import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import { Fragment } from 'react';

export default function SlugDefault({ parameters, onChange }) {
  return (
    <Fragment>
      <WrapperSetting
        title='Default generate path'
        disabled={type === 'form' && params.id !== 'new'}
        value={parameters.depend_field}
        onChange={(ev) => onChange({ ...parameters, depend_field: ev.target.value })}
      />
    </Fragment>
  );
}
