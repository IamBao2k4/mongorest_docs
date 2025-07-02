import DrawerFilter from './DrawerFilter';
import { Filter } from 'lucide-react';
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/Popover';
import clsx from 'clsx';
import { buttonVariants } from '@/components/ui/Button';

function ButtonFilter({ showFilter, query, setQuery, header, onChangeFilter }) {
  const handleCloseFilter = (val) => {
    if (!val) {
      onChangeFilter();
    }
  };

  let _header = header ? JSON.parse(JSON.stringify(header)) : [];

  _header = _header.map((item, index) => {
    return {
      ...item,
      field: item.key,
      label: item.title,
      name: item.key,
      datatype: index,
    };
  });

  return showFilter ? (
    <Popover onOpenChange={handleCloseFilter}>
      <PopoverTrigger
        asChild
        className='cursor-pointer shadow-none'>
        <div
          variant='outline'
          className={clsx(
            buttonVariants({ variant: 'outline' }),
            'gap-1 border-none !shadow-none'
          )}>
          <Filter className='size-4' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
            Filter
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className='!w-[750px]'>
        <DrawerFilter
          query={query}
          setQuery={setQuery}
          header={_header}
          operator={'filter'}
        />
      </PopoverContent>
    </Popover>
  ) : null;
}

export default ButtonFilter;
