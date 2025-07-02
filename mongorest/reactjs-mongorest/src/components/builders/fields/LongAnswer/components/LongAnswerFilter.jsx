import { Input } from '@/components/ui/Input';
import React from 'react';

const LongAnswerFilter = ({ onChange, value, id }) => {
  return (
    <Input
      id={id}
      className='w-full'
      value={value}
      type={'text'}
      onChange={(ev) => {
        onChange(ev.target.value);
      }}
    />
  );
};
export default LongAnswerFilter;
