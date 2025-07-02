import { Input } from '@/components/ui/Input';
import React from 'react';

const ShortAnswerFilter = ({ placeholder, disabled = false, onChange, value }) => {
  return (
    <Input
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      type={'text'}
      onChange={(ev) => {
        onChange(ev.target.value);
      }}
      className='w-full !h-8'
    />
  );
};
export default ShortAnswerFilter;
