import React from 'react';
import { MultiFileEdit } from '../components';

function MultiFileDefault({ parameters, onChange }) {
  return (
    <MultiFileEdit
      onChange={(value) => onChange({ ...parameters, default: value })}
      value={parameters.default}
      schema={{ widget: 'multipleFiles' }}
    />
  );
}

export default MultiFileDefault;
