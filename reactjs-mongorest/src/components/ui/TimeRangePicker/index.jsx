import { CaretRightIcon } from '@radix-ui/react-icons';
import { TimePicker } from '../TimePicker';
import { cn } from '@/lib/utils';

export function TimeRangePicker({ value = [], onChange, disabled }) {
  return (
    <div className={cn('flex gap-2 items-center', disabled && 'cursor-not-allowed')}>
      <TimePicker
        disabled={disabled}
        value={value?.[0]}
        onChange={(newDate) => onChange([newDate, value?.[1]])}
      />
      <CaretRightIcon />
      <TimePicker
        disabled={disabled}
        value={value?.[1]}
        onChange={(newDate) => {
          onChange([value?.[0], newDate]);
        }}
      />
    </div>
  );
}
