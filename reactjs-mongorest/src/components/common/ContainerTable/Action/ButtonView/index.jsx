import { buttonVariants } from '@/components/ui/Button';
import { PanelsTopLeft } from 'lucide-react';
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/Popover';
import clsx from 'clsx';

function ButtonView({ layout = 'grid', setLayout }) {
  return (
    <Popover onOpenChange={() => {}}>
      <PopoverTrigger
        asChild
        className='cursor-pointer shadow-none'>
        <div
          variant='outline'
          className={clsx(
            buttonVariants({ variant: 'outline' }),
            'gap-1 border-none !shadow-none'
          )}>
          <PanelsTopLeft className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
            Layout
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className='!w-[120px] p-2'>
        <div className='flex flex-col gap-[2px] w-full justify-center'>
          {[
            {
              key: 'table',
              title: 'Table',
            },
            {
              key: 'gallery-base',
              title: 'Gallery Base',
            },
            {
              key: 'gallery-lg',
              title: 'Gallery Lg',
            },
          ].map((item) => (
            <div
              key={item.key}
              className={clsx(
                'px-2 py-1 rounded-md hover:bg-gray-200 flex justify-center cursor-pointer',
                layout === item.key ? 'bg-gray-200' : 'bg-transparent'
              )}
              onClick={() => setLayout(item.key)}>
              <p className='text-sm text-default-black capitalize'>{item.title}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ButtonView;
