import { Checkbox } from '@/components/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import _ from 'lodash';
import { useState } from 'react';

const CustomValueSelector = function ({
  context,
  options,
  handleOnChange,
  fieldData,
  path,
  value,
  ...props
}) {
  const { entity, isShowCheckbox, handleChangeCheckbox, currentRules, checked } = context;
  const _entity = entity && Array.isArray(entity) ? JSON.parse(JSON.stringify(entity)) : [];
  const [selected, setSelected] = useState(_entity ? _entity?.[0]?.mongodb_collection_name : null);

  const _options =
    entity && selected ? options.filter((item) => item?.name?.startsWith(selected)) : options;
  return (
    <div className='flex gap-2 h-full self-start'>
      {isShowCheckbox ? (
        <Checkbox
          checked={checked && checked?.includes(value)}
          onCheckedChange={(v) => {
            handleChangeCheckbox(v, value);
          }}
        />
      ) : null}

      {_entity?.length > 0 ? (
        <Select
          onValueChange={setSelected}
          value={_entity[0]?.mongodb_collection_name}>
          <SelectTrigger className='w-[160px] h-8'>
            <SelectValue className='!text-sm text-default-black line-clamp-1' />
          </SelectTrigger>
          <SelectContent>
            {_entity.map((item, index) => (
              <SelectItem
                key={index}
                value={item.mongodb_collection_name}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select
        {...props}
        value={value}
        onValueChange={(value) => {
          handleOnChange(value);
        }}>
        <SelectTrigger className='w-[160px] h-8'>
          <SelectValue className='!text-sm text-default-black line-clamp-1' />
        </SelectTrigger>
        <SelectContent>
          {_options.map((item, index) => (
            <SelectItem
              key={index}
              value={item.name}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomValueSelector;
