import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
function ButtonShowTree({ toggleTree }) {
  return (
    <div className='flex items-center space-x-1'>
      <Switch
        defaultChecked={false}
        onCheckedChange={() => {
          toggleTree && toggleTree();
        }}
      />
      <Label
        htmlFor='airplane-mode'
        className='text-default-black text-sm w-max'>
        Show Tree
      </Label>
    </div>
  );
}

export default ButtonShowTree;
