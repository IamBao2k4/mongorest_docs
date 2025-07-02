import { buttonVariants } from '@/components/ui/Button';
import { Link } from '@/components/ui/Link';
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/Popover';
import clsx from 'clsx';
import { Settings } from 'lucide-react';

function ButtonSetting({ id }) {
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
          <Settings className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
            Setting
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className='!w-[200px] p-2'>
        <div className='flex flex-col gap-[2px] w-full justify-center'>
          {[
            {
              key: 'setting',
              title: 'Edit Json Entity',
            },
          ].map((item, index) => (
            <Link
              href={`/entity/${id}`}
              key={index}>
              <div
                className={clsx(
                  'px-2 py-1 rounded-md hover:bg-gray-200 flex justify-center cursor-pointer'
                )}>
                <p className='text-sm text-default-black capitalize w-max'>{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ButtonSetting;
