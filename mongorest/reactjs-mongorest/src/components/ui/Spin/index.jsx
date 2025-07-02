import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const Spin = ({ children, spinning = true, className }) => {
  return (
    <div className={clsx('relative', className)}>
      {children}
      {spinning ? (
        <div className='absolute top-0 left-0 flex items-center justify-center size-full bg-white/90'>
          <Loader2 className={'w-8 h-8 animate-spin'} />
        </div>
      ) : null}
    </div>
  );
};
