'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { Button } from '../Button';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

export const PopConfirm = forwardRef(
  (
    {
      children,
      title,
      description,
      okText = 'Ok',
      cancelText = 'Cancel',
      onConfirm,
      loadingConfirm,
      onCancel,
      hidePopConfirm,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
      <Popover
        onOpenChange={(open) => {
          setOpen(open);
        }}
        {...props}
        open={open}>
        <PopoverTrigger onClick={() => setOpen(true)}>{children}</PopoverTrigger>
        <PopoverContent>
          <div className='flex gap-2 items-baseline mb-2'>
            <ExclamationTriangleIcon
              type=''
              className='translate-y-[2px] text-yellow-700'
            />
            <div>
              {title && <p className='font-semibold'>{title}</p>}
              {description && <p>{description}</p>}
            </div>
          </div>
          {!hidePopConfirm && (
            <div className='flex items-center justify-end gap-1'>
              <Button
                variant='secondary'
                onClick={() => {
                  onCancel?.();
                  setOpen(false);
                }}>
                {cancelText}
              </Button>
              <Button
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await onConfirm?.();
                    setOpen(false);
                  } finally {
                    setLoading(false);
                  }
                }}>
                <div className='flex items-center gap-2'>
                  {(loadingConfirm || loading) && (
                    <Loader2 className={clsx('w-5 h-5', 'animate-spin')} />
                  )}
                  {okText}
                </div>
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);
