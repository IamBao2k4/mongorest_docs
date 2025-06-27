import { WrapperField } from '@/components/builders/elements';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useEffect } from 'react';
import ListCheckbox from './ListCheckbox';

const CheckBoxEdit = ({ id, schema, onChange, value, required, ...props }) => {
  let error = _.get(props, `formContext.errors[${id}]`);

  const [listCheckBox, setListCheckBox] = React.useState(schema?.choices || []);

  useEffect(() => {
    const data = [...listCheckBox];
    if (typeof value === 'string' && JSON.parse(value)?.length) {
      for (let x = 0; x < data.length; x++) {
        for (let y = 0; y < JSON.parse(value)?.length; y++) {
          if (data[x].value === JSON.parse(value)[y]) {
            data[x]['isChecked'] = true;
          }
        }
      }
      setListCheckBox(data);
    }
  }, [value]);

  useEffect(() => {
    setListCheckBox(schema?.choices);
  }, [JSON.stringify(schema?.choices)]);

  const onChecked = (value) => {
    onChange?.(value);
  };

  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={required}
      error={error}>
      <div className={clsx('flex gap-2', schema?.layout ? 'flex-row' : 'flex-col')}>
        <ListCheckbox
          data={listCheckBox}
          onChecked={onChecked}
          value={value || []}
        />
      </div>
    </WrapperField>
  );
};
export default CheckBoxEdit;
