import React from 'react';

const TextLabel = ({ title = '', description = '', required = false }) => {
  return (
    <div className='flex flex-col text-left'>
      <div className='flex'>
        <p className={`text-base font-bold mb-0`}>
          {required && <span className='text-red-600'>* </span>}
          <span className='formLabel text-black/70'>{title}</span>
        </p>
      </div>
      {description && <p className='mb-0 text-xs text-[#727272]'>{description}</p>}
    </div>
  );
};
export default TextLabel;
