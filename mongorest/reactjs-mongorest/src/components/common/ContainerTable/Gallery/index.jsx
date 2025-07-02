import { Pagination } from '@/components/ui/Pagination';
import Card from './Card';
import clsx from 'clsx';

function Gallery({
  data,
  header,
  isModal,
  total,
  onChangePage,
  setSelect,
  setSelectFlat,
  select,
  typeSelectRow,
  layout,
}) {
  return (
    <>
      <div
        className={clsx(
          'flex-1 overflow-y-auto grid gap-y-8 gap-x-4 px-5 pt-5 pb-5',
          layout === 'gallery-lg'
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-3 xl:grid-cols-4'
        )}>
        {data?.map((item) => (
          <Card
            layout={layout}
            key={item._id}
            header={header}
            isModal={isModal}
            select={select}
            setSelect={setSelect}
            setSelectFlat={setSelectFlat}
            typeSelectRow={typeSelectRow}
            {...item}
          />
        ))}
      </div>
      <div className='flex items-center justify-end py-2 pr-8 h-[45px] border-t border-t-default-border'>
        <Pagination
          total={total}
          showQuickJumper={{ goButton: <></> }}
          showTotal={(total, range) => `${total} items`}
          onChange={() => {}}
          pageSizeOptions={['10', '20', '50', '100']}
          onShowSizeChange={(current, size) =>
            onChangePage({
              current: current,
              pageSize: size,
            })
          }
          showSizeChanger={true}
        />
      </div>
    </>
  );
}

export default Gallery;
