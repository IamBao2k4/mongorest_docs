import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

const CustomAddGroup = function ({ handleOnClick, ...props }) {
  return (
    <Button
      onClick={handleOnClick}
      variant='ghost'
      className='gap-1'>
      <Plus className='w-3 h-3' />
      <span className='text-sm select-none text-black/80'>Add group</span>
    </Button>
  );
};

export default CustomAddGroup;
