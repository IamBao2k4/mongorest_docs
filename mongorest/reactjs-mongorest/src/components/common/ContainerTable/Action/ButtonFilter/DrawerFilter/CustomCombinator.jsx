import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import _ from 'lodash';

const CustomCombinator = function ({ context, options, handleOnChange, fieldData, ...props }) {
  return (
    <Select
      {...props}
      onValueChange={(value) => {
        handleOnChange(value);
      }}>
      <SelectTrigger className='w-[100px] h-8'>
        <SelectValue className='text-sm text-default-black line-clamp-1' />
      </SelectTrigger>
      <SelectContent>
        {options.map((item, index) => (
          <SelectItem
            key={index}
            value={item.name}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomCombinator;
