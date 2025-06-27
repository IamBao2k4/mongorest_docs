import { Button } from '@/components/ui/Button';
import { Popover } from '@/components/ui/Popover';
import { Separator } from '@/components/ui/Separator';
import { withRelation } from '@/hooks/withRelation';
import { CircleX, PlusCircle } from 'lucide-react';

function ArrayItem({ item, handleDeleteTag, value, field }) {
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

        {value?.length < 5 ? (
          value?.map((itemChild, indexChild) => (
            <span
              className='inline-flex items-center border py-0.5 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal'
              key={indexChild}>
              {itemChild?.title || itemChild?.name || itemChild?.username}
            </span>
          ))
        ) : (
          <Popover
            trigger={'hover'}
            content={value?.map((itemChild, indexChild) => (
              <span
                className='inline-flex items-center border py-0.5 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal'
                key={indexChild}>
                {itemChild?.title || itemChild?.name || itemChild?.username}
              </span>
            ))}
            title={item.label}>
            <Button
              className='focus-visible:ring-0 focus-visible:outline-none'
              size='sm'>
              View...
            </Button>
          </Popover>
        )}
      </Button>

      <div
        className='cursor-pointer'
        onClick={() =>
          handleDeleteTag(
            `search[${
              item?.field === 'categories.id' ? item?.field : item?.field?.replace('.', '::')
            }:${item?.operator}]`
          )
        }>
        <CircleX className='w-3.5 h-3.5 text-red-500' />
      </div>
    </div>
  );
}

export default withRelation(ArrayItem);
