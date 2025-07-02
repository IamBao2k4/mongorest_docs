import { Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
const { Option } = Select;
const SelectFilter = ({
  isMulti = false,
  value,
  choices = [],
  defaultValue,
  isDisabled,
  allowNull,
  onChange,
  isTree = false,
}) => {
  const [selectOptions, setSelectOptions] = useState(
    isMulti ? (defaultValue ? defaultValue?.toString()?.split('\n') : []) : defaultValue
  );
  const [listSelected, setListSelected] = useState([]);

  useEffect(() => {
    setListSelected(
      choices
        ? choices.map((item) => ({
            ...item,
            isChecked: false,
          }))
        : [] || []
    );
  }, [choices]);

  const onSelect = (value) => {
    onChange?.(value);
    setSelectOptions(value);
    const data = [...listSelected];
    if (value.length) {
      for (let x = 0; x < data.length; x++) {
        for (let y = 0; y < value.length; y++) {
          if (data[x].value === value[y]) {
            data[x]['isChecked'] = true;
            break;
          } else {
            data[x]['isChecked'] = false;
          }
        }
      }
    } else {
      for (let x = 0; x < data.length; x++) {
        data[x]['isChecked'] = false;
      }
    }
    setListSelected(data);
  };

  const renderListSelected = useMemo(() => {
    return listSelected.map?.((item) => {
      return (
        <Option
          key={item?.value}
          value={item?.value ? (item?.value).toString() : 'null'}
          label={item?.key}>
          <div>{item?.key}</div>
        </Option>
      );
    });
  }, [listSelected]);

  return (
    <Select
      className='w-full !h-8'
      mode={isMulti ? 'multiple' : ''}
      style={{ width: '100%', borderRadius: 5.375 }}
      size='middle'
      value={value || []}
      defaultValue={selectOptions}
      multiple={false}
      disabled={isDisabled}
      dropdownStyle={{ zIndex: 99999 }}
      optionLabelProp='label'
      onChange={onSelect}>
      {allowNull && (
        <Option
          key={'allowNull'}
          value={'default'}>
          {typeof allowNull == 'string' ? allowNull : 'Please Select'}
        </Option>
      )}
      {renderListSelected}
    </Select>
  );
};

export default SelectFilter;
