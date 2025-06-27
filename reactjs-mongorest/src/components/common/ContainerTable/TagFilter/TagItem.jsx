import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { formatRangeString } from '@/helpers/formatRangeString';
import { CircleX, PlusCircle } from 'lucide-react';

function TagItem({ handleDeleteTag, item, field }) {
  if (!item?.value) return null;

  return (
    <div className='relative flex gap-1 items-center'>
      <Button
        variant='outline'
        className='gap-2'>
        <PlusCircle className='w-3.5 h-3.5' />
        {field?.title}
        <Separator
          orientation='vertical'
          className='h-3'
        />
        <span className='inline-flex items-center border py-0.5 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal'>
          {field?.widget === 'dateTime' ? formatRangeString(item?.value) : item?.value}
        </span>
      </Button>
      <div
        className='cursor-pointer'
        onClick={() => handleDeleteTag(`search[${item?.field}:${item?.operator}]`)}>
        <CircleX className='w-3.5 h-3.5 text-red-500' />
      </div>
    </div>
  );
}

export default TagItem;
