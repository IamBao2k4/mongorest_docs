import React from 'react';

const LongAnswerTable = ({ value }) => {
  return <p className='line-clamp-1 text-xs text-default-black'>{value}</p>;
};
export default LongAnswerTable;
