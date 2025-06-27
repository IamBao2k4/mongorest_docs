import { WrapperField } from '@/components/builders/elements';
import { DatePicker } from '@/components/ui/DatePicker';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { TimeRangePicker } from '@/components/ui/TimeRangePicker';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

const DateAndTimeEdit = ({
  schema,
  format,
  state,
  onChangeTime,
  onChangeDate,
  onChangeDateRange,
  onChangeTimeRange,
  showTime,
  disabledDate = () => {},
  ...props
}) => {
  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={props.required}>
      {schema?.formatDate === 'time' &&
        (schema?.mode === 'range' ? (
          <TimeRangePicker
            disabled={schema?.isDisable}
            onChange={(value) =>
              onChangeTimeRange([
                value?.[0] ? dayjs(value?.[0]) : undefined,
                value?.[1] ? dayjs(value?.[1]) : undefined,
              ])
            }
            value={
              !!state
                ? [
                    state.split(',')[0] ? dayjs(state.split(',')[0]).toDate() : undefined,
                    state.split(',')[1] ? dayjs(state.split(',')[1]).toDate() : undefined,
                  ]
                : null
            }
          />
        ) : (
          <TimePicker
            disabled={schema?.isDisable}
            onChange={(value) => onChangeTime(value ? dayjs(value) : undefined)}
            value={
              !!state
                ? dayjs(
                    state.includes(',') ? dayjs(state.split(',')[0]).toDate() : dayjs(state)
                  ).toDate()
                : undefined
            }
          />
        ))}

      {schema?.formatDate !== 'time' &&
        (schema?.mode === 'range' ? (
          <div className='flex flex-col'>
            <DateRangePicker
              disabledDate={disabledDate}
              disabled={schema?.isDisable}
              value={
                !!state
                  ? [
                      state.split(',')[0] ? dayjs(state.split(',')[0]).toDate() : null,
                      state.split(',')[1] ? dayjs(state.split(',')[1]).toDate() : null,
                    ]
                  : null
              }
              onChange={(value) => {
                const date = [
                  value?.[0] ? dayjs(value?.[0]) : undefined,
                  value?.[1] ? dayjs(value?.[1]) : undefined,
                ];
                onChangeTimeRange(date);
              }}
              format={schema?.displayFormat || format}
            />
          </div>
        ) : (
          <DatePicker
            key={state}
            disabledDate={disabledDate}
            disabled={schema?.isDisable}
            format={schema?.displayFormat || format}
            value={state}
            defaultValue={props.defaultValue || null}
            onChange={(value) => {
              onChangeDate(dayjs(value));
            }}
          />
        ))}
    </WrapperField>
  );
};
export default DateAndTimeEdit;
