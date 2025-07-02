import { Input } from '@/components/ui/Input';
import React, { useRef } from 'react';

const ShortAnswerEdit = ({
  id,
  placeholder,
  disabled = false,
  autocomplete,
  onChange,
  width,
  value,
  regex,
  widget,
  minLength,
  maxLength,
}) => {
  const searchInput = useRef(null);
  return (
    <Input
      id={id}
      ref={searchInput}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      type={widget === 'password' ? 'password' : 'text'}
      minLength={minLength}
      maxLength={maxLength}
      autoComplete={widget === 'password' ? 'password' : autocomplete}
      onChange={(ev) => {
        const value = ev.target.value.trimStart();
        onChange(regex ? value.replace(new RegExp(regex, 'gi'), '') : value ? value : undefined);
      }}
      className='w-full'
    />
  );
};
export default ShortAnswerEdit;
