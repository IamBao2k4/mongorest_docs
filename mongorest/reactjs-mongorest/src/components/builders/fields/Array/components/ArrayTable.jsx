import { Tag } from '@/components/ui/Tag';
import React from 'react';

const ArrayTable = ({ value }) => {
  if (value && Array.isArray(value)) {
    return (
      <div className='flex gap-1'>
        {value.map((item, index) => (
          <Tag
            key={index}
            className='cursor-pointer font-medium !px-2 !py-[2px] !text-default-black'>
            <span className='w-max'>{item}</span>
          </Tag>
        ))}
      </div>
    );
  }
  return <></>;
};

export default ArrayTable;
