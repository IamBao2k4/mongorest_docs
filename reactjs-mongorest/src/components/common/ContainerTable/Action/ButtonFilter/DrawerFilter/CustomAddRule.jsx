import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

const CustomAddRule = function ({ handleOnClick }) {
  return (
    <Button
      onClick={handleOnClick}
      variant='ghost'
      className='gap-1'>
      <Plus className='w-3 h-3' />
      <span className='text-sm select-none text-black/80'>Add rule</span>
    </Button>
  );
};

export default CustomAddRule;
