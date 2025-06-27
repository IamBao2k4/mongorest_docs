import { Fields } from '@/components/builders/fields/fields';
import { Checkbox } from '@/components/ui/Checkbox';
import { Image } from '@/components/ui/Image';
import { get_path_img } from '@/helpers/get_path_img';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
function Card({
  header,
  title,
  featured_image,
  isModal,
  setSelect,
  setSelectFlat,
  select,
  selectFlat,
  typeSelectRow,
  layout,
  ...rowValue
}) {
  const { pathname } = useLocation();
  const keyThumbnail = header?.find((item) => item?.widget === 'file' || item?.key === 'path')?.key;
  return (
    <div
      className={clsx(
        'flex gap-3 shadow-md p-4 rounded-md',
        layout === 'gallery-lg' ? 'flex-col xl:flex-row-reverse' : 'flex-col'
      )}
      style={{
        boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
      }}>
      <div
        className={clsx(
          'relative shrink-0',
          layout === 'gallery-lg' ? 'h-[200px] xl:h-[200px] xl:w-[200px]' : 'h-[200px]'
        )}
        onClick={() => {
          if (typeSelectRow === 'radio') {
            setSelect([rowValue?._id]);
            setSelectFlat([rowValue]);
            return;
          }
          if (select.includes(rowValue?._id)) {
            setSelect((pre) => pre.filter((item) => item !== rowValue?._id));
            setSelectFlat((pre) => pre.filter((item) => item?._id !== rowValue?._id));
          } else {
            setSelect((pre) => [...pre, rowValue?._id]);
            setSelectFlat((pre) => [...pre, rowValue]);
          }
        }}>
        <Image
          src={
            rowValue?.[keyThumbnail]
              ? get_path_img(rowValue?.[keyThumbnail])
              : '/images/notFound.jpg'
          }
          alt={title}
          fill
          className='object-cover rounded-md'
        />
        <div className='absolute top-1 right-1 bg-white z-10'>
          <Checkbox checked={select.includes(rowValue?._id)} />
        </div>
      </div>
      <div className='flex flex-col flex-1 gap-3'>
        {title && <p className='text-base font-semibold text-default-link line-clamp-1'>{title}</p>}
        {header
          ?.filter((item) => item.isCheck && item?.key !== 'path')
          ?.map((item) => {
            let value = rowValue?.[item?.key] || rowValue?.[item?.dataIndex];

            const Component = Fields[item.component];

            if (!Component || !value) return <></>;

            const href =
              !isModal &&
              [
                'title',
                'first_name',
                'last_name',
                'name',
                'path',
                'featured_image',
                'featured_image_1',
                'featured_image_2',
              ].includes(item.key)
                ? {
                    pathname: pathname + '/' + rowValue._id,
                  }
                : null;
            return (
              <div className='flex flex-col gap-2'>
                <p className='text-sm text-default-black font-medium'>{item.title}</p>
                <Component
                  key={item.id}
                  value={value}
                  type={item?.widget === 'relation' ? 'card' : 'table'}
                  inforFields={{
                    key: item?.typeRelation?.title,
                    keyTable: item?.key,
                  }}
                  schema={{
                    ...item,
                    href,
                  }}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Card;
