import { useRelation } from '../../../context';
import Tag from './Tag';

function TagsSelected({ data, isGroup, path }) {
  const { setGroup, onChangeProps, schema } = useRelation();
  const onClose = (e, index) => {
    e.preventDefault();
    let copy = JSON.parse(JSON.stringify(data));
    copy.splice(index, 1);
    if (isGroup) {
      setGroup([...copy]);
    } else {
      onChangeProps([...copy]);
    }
  };
  return (
    <div>
      <p className='text-[#BBBBBB] mb-2 text-sm cursor-pointer font-semibold'>Selected</p>
      <div className='mb-2'>
        {data.map((item, index) => {
          return (
            <Tag
              path={path}
              key={item?.id}
              item={item}
              title={item?.title || item?.name || item?.username || item?.email || item?.content}
              disable={schema?.isDisable}
              onClose={(e) => onClose(e, index)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TagsSelected;
