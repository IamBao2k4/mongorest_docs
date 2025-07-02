import React from 'react';
import { IconEdit } from '../components';

function IconDefault({ parameters, onChange }) {
  return (
    <IconEdit
      onChange={(value) => onChange({ ...parameters, default: value })}
      value={parameters.default}
    />
  );
}

export default IconDefault;
