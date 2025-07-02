import { Relation } from '@/components/builders/fields';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { deepFilterKeys } from '@/helpers/deepFilterKeys';

function DataTabs({
  tabs,
  onChangeDataTab,
  optionSelect,
  capitalizeFirstLetter,
  setTabs,
  typeDefault,
  onChange,
}) {
  const _renderTitle = (title) => {
    return <p className='!font-medium mb-[4px]'>{title}</p>;
  };

  return (
    <div className='flex flex-col gap-4 p-2 border border-gray-500 border-dashed rounded-md'>
      {tabs?.map((item, index) => {
        return (
          <div
            className='flex gap-2'
            key={index}>
            {tabs?.length > 1 && (
              <div className='w-[200px]'>
                {_renderTitle('Title Tab')}
                <Input
                  value={item?.title}
                  placeholder='Title Tab'
                  onChange={(val) => {
                    onChangeDataTab('title', val.target.value, index);
                  }}
                />
              </div>
            )}
            <div className='flex-1'>
              {_renderTitle('Type')}
              <Select
                value={item?.type}
                onValueChange={(val) => {
                  onChangeDataTab('type', val, index);
                }}
                className='w-full'>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select field' />
                </SelectTrigger>
                <SelectContent>
                  {optionSelect?.map((item) => {
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
            <div className='flex-1'>
              {_renderTitle('Data')}
              <Relation
                schema={{
                  title: '',
                  description: '',
                  typeSelect: item?.type === 'post' ? 'multiple' : 'once',
                  typeRelation: {
                    title: item?.type === 'post' ? 'post-type-content' : item?.type,
                    entity: item?.type === 'post' ? 'post-type-content' : item?.type,
                  },
                }}
                onChange={(data) => {
                  data = deepFilterKeys(data, [
                    '_id',
                    'title',
                    'slug',
                    'mongodb_collection_name',
                    'type',
                    'post_type',
                    'product_type',
                  ]);
                  onChangeDataTab('data', data, index);
                }}
                value={item?.data || []}
              />
            </div>
            <div className='flex-1'>
              {_renderTitle('Href')}
              <Input
                value={item?.href}
                placeholder='Href (nếu không nhập mặc định là href data đang chọn)'
                onChange={(val) => {
                  onChangeDataTab('href', val.target.value, index);
                }}
              />
            </div>
            <div className='pt-6'>
              <Button
                size='sm'
                onClick={() => handleRemoveTab(index)}>
                Remove
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        size='sm'
        type='button'
        onClick={() => {
          setTabs((pre) => [...pre, { type: typeDefault }]);
          onChange({
            ...value,
            tabs: [...tabs, { type: typeDefault }],
          });
        }}>
        Add New Tab
      </Button>
    </div>
  );
}

export default DataTabs;
