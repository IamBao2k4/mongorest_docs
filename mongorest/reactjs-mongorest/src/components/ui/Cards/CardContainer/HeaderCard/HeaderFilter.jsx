import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { refApi } from '@/services/refApi';
import { useEffect, useState } from 'react';

const HeaderFilter = ({
  title,
  description,
  layout,
  isFilter,
  posttypeId,
  filterState,
  setFilterState,
  ...props
}) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await refApi().getList({
          endpoint: 'categories',
          params: { limit: 10, page: 1, post_type: posttypeId },
        });
        if (res && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin tức:', error);
      }
    };

    fetchCategories();
  }, [posttypeId]);

  return (
    <div className='mb-5 flex w-full flex-col items-start justify-between sm:mb-21 md:flex-row'>
      {/* Header Section */}
      {layout === '2' && (
        <div className='flex w-full max-w-[410px] flex-col gap-2 sm:gap-6'>
          <h2 className='text-2xl font-semibold sm:text-3xl lg:text-[32px]'>{title}</h2>
          <p className='text-base sm:text-lg lg:text-xl'>{description}</p>
        </div>
      )}

      {isFilter && (
        <div
          className={cn(
            'mt-6 w-full space-y-4 sm:space-y-6 md:mt-0',
            layout === 2 ? 'sm:pl-20' : ''
          )}>
          <div className='text-sm font-semibold text-[#727272] sm:text-base lg:text-base'>
            DANH MỤC
          </div>
          <div className='scrollbar-hide flex gap-4 overflow-x-auto md:flex-wrap'>
            {layout === 2 ? (
              <Button
                className={cn(
                  'min-h-10 flex-shrink-0 rounded-none px-5 py-[10px] text-sm font-normal whitespace-nowrap transition-all duration-300 hover:bg-[#272727] hover:text-white sm:min-h-[46px] sm:text-base md:flex-shrink md:px-10 md:py-3',
                  !filterState?.category
                    ? 'bg-[#272727] text-white'
                    : 'border border-[#BDC4CC] bg-white text-[#727272]'
                )}
                onClick={() =>
                  setFilterState((pre) => {
                    delete pre.category;
                    return {
                      ...pre,
                      page: 1,
                    };
                  })
                }>
                TẤT CẢ
              </Button>
            ) : null}

            {categories &&
              categories.map((category, index) => (
                <Button
                  key={category._id || index}
                  className={cn(
                    'min-h-10 flex-shrink-0 rounded-none px-5 py-[10px] text-sm font-normal whitespace-nowrap uppercase transition-all duration-300 hover:bg-[#272727] hover:text-white sm:min-h-[46px] sm:text-base md:flex-shrink md:px-10 md:py-3',
                    filterState?.category === category._id
                      ? 'bg-[#272727] text-white'
                      : 'border border-[#BDC4CC] bg-white text-[#727272]'
                  )}
                  onClick={() =>
                    setFilterState((pre) => {
                      return {
                        ...pre,
                        category: category._id,
                        page: 1,
                      };
                    })
                  }>
                  {category.title}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderFilter;
