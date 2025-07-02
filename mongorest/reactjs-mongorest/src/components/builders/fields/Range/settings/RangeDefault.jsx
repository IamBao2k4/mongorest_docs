import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import React from 'react';

const elementSetting = {
  title: 'Defalut number',
  typeField: 'number',
  key: 'default',
  placeholder: 'Default',
};

function RangeDefault({ parameters, onChange }) {
  return (
    <React.Fragment>
      <WrapperSetting
        title={elementSetting.title}
        typeField={elementSetting.typeField}
        value={parameters.default}
        onChange={(val) => onChange({ ...parameters, default: val.target.value })}
        placeholder={elementSetting.placeholder}
      />
    </React.Fragment>
  );
}

export default RangeDefault;
