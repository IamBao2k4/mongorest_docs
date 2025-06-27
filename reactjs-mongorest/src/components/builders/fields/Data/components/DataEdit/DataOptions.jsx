import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

function DataOptions({ value, onChange, schema, capitalizeFirstLetter }) {
  const modePaging = value?.modePaging || schema?.optionPaging?.[0] || 'none';
  const hiddenPerView = schema?.hiddenPerView;
  const limit = value?.limit;
  const perView = value?.perView || '4,2,1';
  const slidePerView = value?.slidePerView || 4;

  const optionPaging = (typeof schema?.optionPaging === 'string'
    ? schema?.optionPaging.split(', ')
    : schema?.optionPaging) || ['none', 'pagination', 'loadMore', 'slider', 'goToPage'];

  const optionPerview = [
    { label: 'PC: 4, Tablet: 4, Mobile: 1', value: '4,4,1' },
    { label: 'PC: 4, Tablet: 3, Mobile: 1', value: '4,3,1' },
    { label: 'PC: 4, Tablet: 2, Mobile: 2', value: '4,2,2' },
    { label: 'PC: 4, Tablet: 2, Mobile: 1', value: '4,2,1' },
    { label: 'PC: 3, Tablet: 3, Mobile: 1', value: '3,3,1' },
    { label: 'PC: 3, Tablet: 2, Mobile: 1', value: '3,2,1' },
    { label: 'PC: 3, Tablet: 1, Mobile: 1', value: '3,1,1' },
    { label: 'PC: 2, Tablet: 2, Mobile: 2', value: '2,2,2' },
    { label: 'PC: 2, Tablet: 2, Mobile: 1', value: '2,2,1' },
    { label: 'PC: 1, Tablet: 1, Mobile: 1', value: '1,1,1' },
  ];

  const _renderTitle = (title) => {
    return <p className='!font-medium mb-[4px]'>{title}</p>;
  };

  return (
    <div className='flex items-start flex-1 gap-2'>
      {optionPaging?.length > 1 ? (
        <div className='flex-1'>
          {_renderTitle('Mode Paging')}
          <Select
            value={modePaging}
            onValueChange={(val) => {
              onChange({
                ...value,
                modePaging: val,
              });
            }}
            className='w-full'>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select field' />
            </SelectTrigger>
            <SelectContent>
              {optionPaging?.map((item) => {
                return (
                  <SelectItem
                    key={item}
                    value={item}>
                    {capitalizeFirstLetter(item)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className='flex-1'>
        {_renderTitle('Limit')}
        <Input
          value={limit}
          placeholder='Limit'
          type='number'
          onChange={(val) => {
            onChange({
              ...value,
              limit: val.target.value,
            });
          }}
        />
      </div>
      {!hiddenPerView && modePaging !== 'slider' ? (
        <div className='flex-1'>
          {_renderTitle('Per View')}
          <Select
            value={perView}
            onValueChange={(val) => {
              onChange({
                ...value,
                perView: val,
              });
            }}
            className='w-full'>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select field' />
            </SelectTrigger>
            <SelectContent>
              {optionPerview?.map((item) => {
                return (
                  <SelectItem
                    key={item.value}
                    value={item.value}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {modePaging === 'slider' ? (
        <div className='flex-1'>
          {_renderTitle('Slide Per View')}
          <Select
            value={slidePerView}
            onValueChange={(val) => {
              onChange({
                ...value,
                slidePerView: val,
              });
            }}
            className='w-full'>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select field' />
            </SelectTrigger>
            <SelectContent
              items={[
                { label: 3, value: 3 },
                { label: 4, value: 4 },
              ]}
            />
          </Select>
        </div>
      ) : null}
    </div>
  );
}

export default DataOptions;
