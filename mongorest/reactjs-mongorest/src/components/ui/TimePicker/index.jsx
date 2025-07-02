import { Clock } from 'lucide-react';
import { useRef } from 'react';
import { TimePickerInput } from './components/TimePickerInput';

export function TimePicker({ value, onChange, disabled }) {
  const minuteRef = useRef(null);
  const hourRef = useRef(null);
  const secondRef = useRef(null);

  return (
    <div className='flex items-center gap-1 border rounded-lg w-fit bg-white pr-3'>
      <div className='flex h-10 items-center'>
        <Clock className='ml-2 h-4 w-4 text-slate-500' />
      </div>
      <div className='grid gap-1 text-center'>
        <TimePickerInput
          disabled={disabled}
          picker='hours'
          date={value}
          setDate={onChange}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      :
      <div className='grid gap-1 text-center'>
        <TimePickerInput
          disabled={disabled}
          picker='minutes'
          date={value}
          setDate={onChange}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      :
      <div className='grid gap-1 text-center'>
        <TimePickerInput
          disabled={disabled}
          picker='seconds'
          date={value}
          setDate={onChange}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
      </div>
    </div>
  );
}
