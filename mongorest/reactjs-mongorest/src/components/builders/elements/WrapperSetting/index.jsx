import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@/components/ui/MultiSelect';
import Picker from 'rc-picker';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';
import viVN from 'rc-picker/lib/locale/vi_VN';
import 'rc-picker/assets/index.css';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import TextError from '../TextError';
import { Textarea } from '@/components/ui/Textarea';
import { useState } from 'react';
import { format } from 'date-fns';
function WrapperSetting({
  title,
  typeField = 'input',
  required,
  options = null,
  optionsLevel1 = null,
  error,
  onChangeDate = null,
  field = null,
  parameters = {},
  ...props
}) {
  const [dateValue, setDateValue] = useState(
    title === 'Min' && parameters.min
      ? new Date(parameters.min)
      : title === 'Max' && parameters.max
      ? new Date(parameters.max)
      : null
  );
  const [timeValue, setTimeValue] = useState(() => {
    if (title === 'Min' && parameters.min) {
      return new Date(`1970-01-01T${parameters.min}`);
    } else if (title === 'Max' && parameters.max) {
      return new Date(`1970-01-01T${parameters.max}`);
    } else {
      return null;
    }
  });

  const onChange = (newValue) => {
    newValue = newValue ? newValue : '';

    if (newValue) {
      if (parameters.mode === 'time') {
        setTimeValue(newValue);
        onChangeDate(format(newValue, 'HH:mm:ss'));
      } else {
        const isoValue = new Date(newValue).toISOString();
        setDateValue(new Date(isoValue));
        onChangeDate(isoValue);
      }
    } else {
      setDateValue(null);
      onChangeDate('');
    }
  };
  const disabledDate = (current) => {
    if (!current) return false;

    const maxDate = parameters.max ? new Date(parameters.max) : null;
    const minDate = parameters.min ? new Date(parameters.min) : null;

    if (!minDate && !maxDate) return false;

    if (title.toLowerCase() === 'min' && maxDate) {
      return current > maxDate;
    }
    if (title.toLowerCase() === 'max' && minDate) {
      return current < minDate;
    }
    return false;
  };
  const disabledTime = (current) => {
    if (!current) return null;

    const minTime = parameters.min ? new Date(`1970-01-01T${parameters.min}`) : null;
    const maxTime = parameters.max ? new Date(`1970-01-01T${parameters.max}`) : null;

    if (parameters.mode === 'time') {
      if (!minTime && !maxTime) return null;

      return {
        disabledHours: () =>
          Array.from({ length: 24 }, (_, hour) => {
            if (minTime && hour < minTime.getHours()) return hour;
            if (maxTime && hour > maxTime.getHours()) return hour;
            return null;
          }).filter((hour) => hour !== null),

        disabledMinutes: (hour) =>
          (minTime && hour === minTime.getHours()) || (maxTime && hour === maxTime.getHours())
            ? Array.from({ length: 60 }, (_, minute) => {
                if (minTime && hour === minTime.getHours() && minute < minTime.getMinutes())
                  return minute;
                if (maxTime && hour === maxTime.getHours() && minute > maxTime.getMinutes())
                  return minute;
                return null;
              }).filter((minute) => minute !== null)
            : [],

        disabledSeconds: (hour, minute) =>
          (minTime && hour === minTime.getHours() && minute === minTime.getMinutes()) ||
          (maxTime && hour === maxTime.getHours() && minute === maxTime.getMinutes())
            ? Array.from({ length: 60 }, (_, second) => {
                if (
                  minTime &&
                  hour === minTime.getHours() &&
                  minute === minTime.getMinutes() &&
                  second < minTime.getSeconds()
                )
                  return second;
                if (
                  maxTime &&
                  hour === maxTime.getHours() &&
                  minute === maxTime.getMinutes() &&
                  second > maxTime.getSeconds()
                )
                  return second;
                return null;
              }).filter((second) => second !== null)
            : [],
      };
    }

    // Handle scenarios outside of mode === 'time'
    if (title === 'Max' && minTime && current.toDateString() === minTime.toDateString()) {
      return {
        disabledHours: () =>
          Array.from({ length: 24 }, (_, hour) =>
            hour < minTime.getHours() ||
            (hour === minTime.getHours() && minTime.getMinutes() === 59)
              ? hour
              : null
          ).filter(Boolean),
        disabledMinutes: (hour) =>
          hour === minTime.getHours()
            ? Array.from({ length: 60 }, (_, minute) =>
                minute < minTime.getMinutes() ||
                (minute === minTime.getMinutes() && minTime.getSeconds() === 59)
                  ? minute
                  : null
              ).filter(Boolean)
            : [],
        disabledSeconds: (hour, minute) =>
          hour === minTime.getHours() && minute === minTime.getMinutes()
            ? Array.from({ length: 60 }, (_, second) =>
                second <= minTime.getSeconds() ? second : null
              ).filter(Boolean)
            : [],
      };
    }

    return false;
  };

  const dateProps = {
    generateConfig: dateFnsGenerateConfig,
    onChange,
  };
  const _renderField = () => {
    if (options && typeField !== 'multiSelect') {
      return (
        <Select
          {...props}
          onValueChange={props?.onChange}
          className='w-full'>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select field' />
          </SelectTrigger>
          <SelectContent>
            {options?.map((item) => {
              return (
                <SelectGroup key={item.label}>
                  <SelectLabel>{item.label}</SelectLabel>
                  {item.options?.map((opt) => {
                    return (
                      <SelectItem
                        key={opt?.value}
                        className='px-5'
                        value={opt?.value}>
                        {opt.label}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              );
            })}
          </SelectContent>
        </Select>
      );
    }

    if (optionsLevel1) {
      return (
        <Select
          {...props}
          onValueChange={props?.onChange}
          defaultValue={props?.value}
          className='w-full'>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select field' />
          </SelectTrigger>
          <SelectContent>
            {optionsLevel1?.map((item, index) => {
              return (
                <SelectItem
                  key={index}
                  value={item?.value}>
                  {item.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    }

    if (typeField === 'input') {
      return <Input {...props} />;
    }

    if (typeField === 'password') {
      return (
        <Input
          {...props}
          type='password'
        />
      );
    }

    if (typeField === 'number') {
      return (
        <Input
          {...props}
          type='number'
        />
      );
    }

    if (typeField === 'boolean') {
      return (
        <Switch
          checked={props?.checked}
          onCheckedChange={props?.onCheckedChange}
          {...props}
        />
      );
    }

    if (typeField === 'choose') {
      return (
        <RadioGroup
          {...props}
          defaultValue={props.value || props?.choose[0]?.value}
          onValueChange={props?.onChange}>
          {props?.choose.map((item, index) => (
            <div
              key={index}
              className='flex items-center space-x-2'>
              <RadioGroupItem
                value={item.value}
                id={item.key}
              />
              <Label htmlFor={item.key}>{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (typeField === 'textarea') {
      return <Textarea {...props} />;
    }

    if (typeField === 'checkbox') {
      return (
        <div className='flex flex-col'>
          <Label htmlFor={props?.key}>{props?.title}</Label>
          <Checkbox
            id={props?.key}
            {...props}
          />
        </div>
      );
    }
    //==============================================================
    //* Date Time Picker
    if (typeField === 'date') {
      return (
        <Picker
          style={{ border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '8px' }}
          dropdownClassName={'border-0'}
          {...dateProps}
          locale={viVN}
          value={dateValue}
          disabledDate={disabledDate}
          disabledTime={disabledTime}
          showTime={parameters.mode === 'time' || parameters.mode === 'dateTime'}
          {...(parameters.mode !== 'dateTime' && { picker: parameters.mode })}
        />
      );
    }
    if (typeField === 'time') {
      return (
        <Picker
          style={{ border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '8px' }}
          dropdownClassName={'border-0'}
          {...dateProps}
          locale={viVN}
          disabledTime={disabledTime}
          value={timeValue}
          showtime
          picker='time'
        />
      );
    }

    //==============================================================
    if (typeField === 'multiSelect') {
      return (
        <MultiSelector
          {...props}
          values={props?.values}
          onValuesChange={props?.onValuesChange}
          data={options}
          loop
          key={props?.keyItem}
          onChange={props?.onChange}
          parameters={props?.parameters}
          className='max-w-full'>
          <MultiSelectorTrigger>
            <MultiSelectorInput placeholder='Select value' />
          </MultiSelectorTrigger>
          <MultiSelectorContent>
            <MultiSelectorList>
              {options?.map((item, index) => (
                <MultiSelectorItem
                  key={index}
                  value={item?.value}>
                  {item?.label}
                </MultiSelectorItem>
              ))}
            </MultiSelectorList>
          </MultiSelectorContent>
        </MultiSelector>
      );
    }
  };
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex flex-row items-center gap-3'>
        <Label className='w-max shrink-0 font-semibold text-xs'>
          {title} {required ? <span className='text-red-600'>*</span> : null}
        </Label>
        {/* {props?.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info
                  size={18}
                  color='#000000'
                  className='cursor-pointer'
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{props?.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )} */}
      </div>
      {_renderField()}
      <TextError text={error} />
    </div>
  );
}

export default WrapperSetting;
