import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

const CustomValueSelector = function ({ handleOnClick, ...props }) {
  return (
    <Button
      variant='ghost'
      onClick={handleOnClick}
      className='self-start'>
      <Trash2 className='w-4 h-4' />
    </Button>
  );
};

export default CustomValueSelector;
