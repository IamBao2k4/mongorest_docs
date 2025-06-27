import { cn } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';

export const Tag = ({ children, closable, onClose, disabled, color = '#FAFAFA', ...props }) => {
  return (
    <div className='relative'>
      <div
        {...props}
        style={{ background: color }}
        className={cn(
          'px-2 py-[5px] mr-2 inline-flex items-center gap-1 text-xs border rounded-sm text-[#000000e0] relative',
          props.className,
          disabled && 'cursor-not-allowed grayscale',
          closable && 'pr-7'
        )}>
        {children}
      </div>
      {closable && (
        <div className='absolute right-2 bottom-0 top-0 flex items-center z-10'>
          <div className='p-2'>
            <Cross2Icon
              onClick={onClose}
              className={cn('text-xs cursor-pointer', disabled && 'pointer-events-none')}
              width={12}
            />
          </div>
        </div>
      )}
    </div>
  );
};
