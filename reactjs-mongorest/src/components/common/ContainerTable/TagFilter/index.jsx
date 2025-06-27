import ArrayItem from './ArrayItem';
import TagItem from './TagItem';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

export default function TagFilter({
  queryUrl = {},
  handleDeleteTag = () => {},
  hideFilter = false,
  queryFilter,
  header,
}) {
  const upperString = (val) => {
    return (val.charAt(0).toUpperCase() + val.slice(1)).replace(/_/g, ' ');
  };

  if (!(queryFilter?.rules?.length > 0) || hideFilter) return <></>;

  const renderFilter = () => {
    return queryFilter?.rules?.map((item, index) => {
      const field = header?.find((head) => item.field === head.key);

      if (Array.isArray(item?.value) && item?.value?.length > 0) {
        return (
          <ArrayItem
            item={item}
            value={item?.value || []}
            key={index}
            handleDeleteTag={handleDeleteTag}
            field={field}
            inforFields={{ key: field?.typeRelation?.title }}
          />
        );
      }

      return (
        <TagItem
          item={item}
          key={index}
          handleDeleteTag={handleDeleteTag}
          field={field}
        />
      );
    });
  };

  return (
    <>
      {renderFilter()}
      {queryUrl?.name ? (
        <Badge
          variant={'outline'}
          count={
            <X
              onClick={() => handleDeleteTag('name')}
              className='text-[#f5222d] cursor-pointer'
            />
          }>
          <div
            className='p-2 rounded-md'
            style={{
              border: 'solid 1px #d9d9d9',
            }}>
            {upperString('name')}: {queryUrl?.name}
          </div>
        </Badge>
      ) : null}
    </>
  );
}
