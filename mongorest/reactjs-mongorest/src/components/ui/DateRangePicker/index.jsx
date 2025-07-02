import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-date-range';
import { Input } from '../Input';
import { PopoverContent, Popover, PopoverTrigger } from '../Popover';

const getRangeFormatted = (value, format) => {
  if (!value?.length) {
    return '';
  }
  return `${value?.[0] ? dayjs(value?.[0]).format(format) : '__/__/____'}  -  ${
    value?.[1] ? dayjs(value?.[1]).format(format) : '__/__/____'
  }`;
};

export function DateRangePicker({ onChange, value, format = 'YYYY-MM-DD', disabled }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => getRangeFormatted(value, format));

  useEffect(() => {
    if (value?.length) {
      const valueFormatted = getRangeFormatted(value, format);
      setInputValue(valueFormatted);
    }
  }, [value]);

  return (
    <Popover
      onOpenChange={setOpen}
      open={open}>
      <PopoverTrigger
        className='w-full'
        onClick={() => setOpen(true)}
        disabled={disabled}>
        <Input
          className='min-w-[330px] w-full'
          disabled={disabled}
          value={inputValue}
          onClick={(e) => {
            e.preventDefault();
          }}
          readOnly
        />
      </PopoverTrigger>
      <PopoverContent
        className={'w-auto'}
        side='top'>
        <DateRange
          onChange={(item) => {
            onChange([item.selection.startDate, item.selection.endDate]);
          }}
          moveRangeOnFirstSelection={false}
          ranges={[
            {
              startDate: value?.[0] || new Date(),
              endDate: value?.[1] || null,
              key: 'selection',
            },
          ]}
          dateDisplayFormat={'dd/MM/yyyy'}
          showSelectionPreview={true}
          months={2}
          direction='horizontal'
          preventSnapRefocus={true}
          calendarFocus='backwards'
        />
      </PopoverContent>
    </Popover>
  );
}
