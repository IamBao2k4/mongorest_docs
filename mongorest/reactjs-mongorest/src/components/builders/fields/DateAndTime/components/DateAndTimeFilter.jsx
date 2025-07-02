import { DateRangePicker } from '@/components/ui/DateRangePicker';
import dayjs from 'dayjs';

const DateAndTimeFilter = ({ state, onChangeRange }) => {
  return (
    <DateRangePicker
      value={
        state && state.split(',')[0] && state.split(',')[1]
          ? [dayjs(state.split(',')[0]).toDate(), dayjs(state.split(',')[1]).toDate()]
          : ['', '']
      }
      onChange={(value) => {
        const date = [
          value?.[0] ? dayjs(value?.[0]) : undefined,
          value?.[1] ? dayjs(value?.[1]) : undefined,
        ];
        onChangeRange(date);
      }}
      format='YYYY-MM-DD'
      style={{ width: '100%' }}
    />
  );
};
export default DateAndTimeFilter;
