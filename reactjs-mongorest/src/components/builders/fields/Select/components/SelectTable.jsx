import React from 'react';

const SelectTable = ({ value, isMulti, choices }) => {
  if (Array.isArray(value)) {
    return (
      <p>
        {choices
          .filter((item) => value.includes(item.value))
          .map((item) => item.key)
          .join(',')}
      </p>
    );
  }
  return <p>{choices.find((item) => item.value === value)?.key}</p>;
};

export default SelectTable;
