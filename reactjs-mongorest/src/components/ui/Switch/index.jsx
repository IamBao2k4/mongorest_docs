import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';
import { Label } from '../Label';

const Switch = React.forwardRef(({ className, label, ...props }, ref) => {
  return (
    <div className='flex gap-[6px] items-center'>
      <SwitchPrimitives.Root
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
          className
        )}
        {...props}
        ref={ref}>
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitives.Root>
      {label ? (
        <Label
          htmlFor=''
          className='text-black/70 text-[13px]'>
          {label}
        </Label>
      ) : null}
    </div>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
