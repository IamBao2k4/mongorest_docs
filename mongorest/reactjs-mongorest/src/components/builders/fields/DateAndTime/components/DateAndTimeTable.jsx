import React from 'react';
import dayjs from 'dayjs';
import _ from 'lodash';

const DateAndTimeTable = ({value}) => {
  return (
    <p className="mb-0 font-medium">
      {value ? dayjs(_.replace(value, '0Z', '')).format('YYYY-MM-DD HH:mm:ss') : null}
    </p>
  );
};
export default DateAndTimeTable;
