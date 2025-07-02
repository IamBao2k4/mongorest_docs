import { CalendarIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { format as formatFns } from 'date-fns';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Calendar } from 'react-date-range';
import { Button } from '../Button';
import { PopoverContent, Popover, PopoverTrigger } from '../Popover';
export function DatePicker({ onChange, value, format = 'YYYY-MM-DD' }) {
  const _format = format.replace('DD', 'dd').replace('YYYY', 'yyyy');
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? dayjs(value).format(_format) : '');

  const checkIsValid = (value) => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    const isRegex = regex.test(value);
    if (!isRegex) return false;

    return dayjs(value, _format, true).isValid();
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (checkIsValid(newValue)) {
      onChange(newValue);
    }
  };

  const handleCalendarChange = (newValue) => {
    setOpen(false);
    onChange(newValue);
    setInputValue(dayjs(newValue).format(_format));
  };

  const validateInput = () => {
    if (!checkIsValid(inputValue)) {
      setInputValue(value ? dayjs(value).format(_format) : '');
    }
  };

  useEffect(() => {
    if (checkIsValid(value)) {
      setInputValue(dayjs(value).format(_format));
    }
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={clsx('w-full pl-3 text-left font-normal', !value && 'text-muted-foreground')}>
          {value ? formatFns(value, _format) : <span>Pick a date</span>}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0'
        align='start'>
        <Calendar
          date={value ? dayjs(value).toDate() : null}
          onChange={handleCalendarChange}
        />
      </PopoverContent>
    </Popover>
  );
}
