import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, onPressEnter, type, errors, ...props }, ref) => {
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onPressEnter && onPressEnter();
    }
  };
  return (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full outline-none focus:outline-none focus:ring-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      ref={ref}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
