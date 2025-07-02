import { Relation } from '@/components/builders/fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { deepFilterKeys } from '@/helpers/deepFilterKeys';
function HrefEdit({ value, onChange, schema }) {
  const [type, setType] = useState(value?.typeUrl);
  const [select, setSelect] = useState(value?.relation || []);

  const handleChangeType = (val) => {
    setType(val);
    setSelect([]);
    onChange({
      ...value,
      typeUrl: val,
      href: '',
      relation: [],
    });
  };

  const handleSelect = (val) => {
    if (val?.length > 0) {
      const _data = val[0];
      let href =
        '/' +
        (type === 'post' || type === 'category'
          ? `${_data?.product_type?.[0]?.slug}/${_data?.slug}`
          : _data?.slug);

      const result = {
        ...value,
        href,
        relation: val,
      };

      onChange(result);
    } else {
      onChange({
        ...value,
        href: '#',
        relation: val,
      });
    }

    setSelect(val);
  };
  return (
    <div className='border-2 border-black/80 border-solid p-4 rounded-md'>
      <div className='flex flex-col gap-3'>
        {!schema?.hiddenTitle ? (
          <div className='flex-1'>
            <div>
              <p className='!font-medium text-lg leading-[100%] mb-1'>{schema?.title}</p>
              <p className='!font-medium mb-2 text-xs'>Nhập title và href</p>
            </div>
            <Input
              value={value?.title}
              placeholder='Nhập title cho href'
              onChange={(val) => {
                onChange({
                  ...value,
                  title: val.target.value,
                });
              }}
            />
          </div>
        ) : null}

        <div className='flex gap-2 items-start'>
          <div>
            <Select
              value={type}
              onValueChange={handleChangeType}
              className='w-full'>
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='Select field' />
              </SelectTrigger>
              <SelectContent>
                {optionsGet.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex-1'>
            {type === 'url' || !type ? (
              <Input
                value={value?.href}
                placeholder='Href (nếu không nhập mặc định là href data đang chọn)'
                onChange={(val) => {
                  onChange({
                    ...value,
                    href: val.target.value,
                  });
                }}
              />
            ) : (
              <Relation
                schema={{
                  title: '',
                  description: '',
                  typeSelect: 'once',
                  typeRelation: {
                    title: type,
                    entity: type,
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
                  handleSelect(data);
                }}
                value={select || []}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HrefEdit;

const optionsGet = [
  {
    value: 'post-type',
    label: 'Posttype',
  },
  {
    value: 'category',
    label: 'Category',
  },
  {
    value: 'post-type-content',
    label: 'Post',
  },
  {
    value: 'page-ai',
    label: 'Page',
  },
  {
    value: 'url',
    label: 'URL',
  },
];
