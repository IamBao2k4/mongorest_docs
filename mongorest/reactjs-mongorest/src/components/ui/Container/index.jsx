import clsx from 'clsx';
import React, { forwardRef } from 'react';

export const Container = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('max-w-[1150px] mx-auto px-5 sm:px-10 lg:px-7 py-10', className)}
      {...props}>
      {children}
    </div>
  );
});
