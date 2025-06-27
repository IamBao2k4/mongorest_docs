import React from 'react';
const RenderActiveStatus = ({value = false}) => (
  <div
    style={{
      backgroundColor: value ? 'green' : 'red',
      borderRadius: 99,
      width: 10,
      height: 10,
    }}
  />
);
const BooleanTable = ({value}) => {
  return <RenderActiveStatus value={value} />;
};

export default BooleanTable;
