import SelectHeader from './SelectHeader';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ButtonColumn({ header, pathProp, onChangeHeader }) {
  const [visibleHeader, setVisibleHeader] = useState(false);

  const handleCloseHeader = () => {
    setVisibleHeader(false);
  };

  const handleShowHeader = (flag) => {
    setVisibleHeader(flag);
    if (!flag) {
      handleCloseHeader();
    }
  };
  return (
    <Popover
      open={visibleHeader}
      onOpenChange={handleShowHeader}>
      <PopoverTrigger asChild>
        <div>
          <Button
            variant='outline'
            className='gap-1 border-none shadow-none'>
            <List className='size-4' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
              Columns
            </span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className='!w-auto'>
        <SelectHeader
          header={header}
          pathProp={pathProp}
          onChangeHeader={onChangeHeader}
          handleCloseHeader={handleCloseHeader}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ButtonColumn;
