'use client';

import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { DateAndTimeEdit, DateAndTimeFilter, DateAndTimeTable } from './components';
import { TextError } from '@/components/builders/elements';
const defaultFormatObj = {
  'date-time': 'YYYY/MM/DD : HH:mm a',
  date: 'YYYY/DD/MM',
  time: 'HH:mm a',
};
const DatePickerComp = ({ id, schema, value, onChange, disabledDate, type = 'edit', ...props }) => {
  let error = _.get(props, `formContext.errors[${props?.id}]`);
  const [showTime, setShowTime] = useState(false);
  const [format, setFormat] = useState('date');
  const [state, setState] = useState();

  useEffect(() => {
    if (schema?.formatDate) {
      if (schema?.formatDate === 'date-time') {
        setShowTime(true);
        setFormat(defaultFormatObj[schema?.formatDate]);
      }
    }
    setState(value);
  }, [value, schema?.formatDate]);
  function onChangeDate(time, str) {
    setState(str);

    onChange(time.$d.toISOString());
  }

  function onChangeTime(time, str) {
    onChange(time.$d.toISOString());
  }

  function onChangeDateRange(date, str) {
    const date1 = date[0] ? date[0].$d.toISOString() : '';
    const date2 = date[1] ? date[1].$d.toISOString() : '';
    onChange(date1 + ',' + date2);
  }

  function onChangeTimeRange(time, str) {
    const time1 = time[0] ? time[0].$d.toISOString() : '';
    const time2 = time[1] ? time[1].$d.toISOString() : '';
    onChange(time1 + ',' + time2);
  }

  return (
    <div id={id}>
      {type === 'filter' ? (
        <DateAndTimeFilter
          onChangeRange={onChangeDateRange}
          state={state}
        />
      ) : null}

      {type === 'edit' ? (
        <DateAndTimeEdit
          onChangeTime={onChangeTime}
          onChangeDate={onChangeDate}
          onChangeDateRange={onChangeDateRange}
          onChangeTimeRange={onChangeTimeRange}
          schema={schema}
          format={format}
          state={state}
          showTime={showTime}
          disabledDate={disabledDate}
          {...props}
        />
      ) : null}

      {type === 'table' ? <DateAndTimeTable value={value} /> : null}

      {!!error && <TextError text={error} />}
    </div>
  );
};
export default DatePickerComp;
