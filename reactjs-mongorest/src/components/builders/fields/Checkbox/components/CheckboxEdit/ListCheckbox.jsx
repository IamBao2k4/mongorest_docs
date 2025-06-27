import { Checkbox } from '@/components/ui/Checkbox';

function ListCheckbox({ data, onChecked, value }) {
  if (!(data?.length > 0)) return <></>;

  return data?.map((item, index) => (
    <div
      className='flex gap-2 items-center'
      key={index}>
      <Checkbox
        checked={value?.includes(item.value)}
        onCheckedChange={(checked) => {
          return checked
            ? onChecked([...value, item.value])
            : onChecked(value?.filter((value) => value !== item.value));
        }}
      />
      <span className='font-semibold text-sm'>{item.key}</span>
    </div>
  ));
}

export default ListCheckbox;
