import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { useAuth } from '@/context/AuthContext';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const IconEdit = ({ onChange, value }) => {
  // Test CI/CD
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [iconList, setIconList] = useState([]);
  const [displayedIcons, setDisplayedIcons] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [useSvgs, setUseSvgs] = useState(false);
  const { tenant } = useAuth();
  const itemsPerLoad = 200;
  const [svgs, setSvgs] = useState([]);

  useEffect(() => {
    const loadIcons = async () => {
      if (tenant) {
        try {
          // Sử dụng import.meta.glob để lấy tất cả SVG files
          const modules = import.meta.glob('/public/icons/**/*.svg');
          const iconFiles = Object.keys(modules)
            .filter((path) => path.includes(`/icons/${tenant._id}/`))
            .map((path) => path.split('/').pop()); // Lấy tên file

          setSvgs(iconFiles);
        } catch (error) {
          console.error('Error loading icons:', error);
        }
      }
    };

    loadIcons();
  }, [tenant]);

  // Lọc và chuẩn bị danh sách icon lúc component khởi tạo
  useEffect(() => {
    // Kiểm tra có sử dụng SVGs hay không
    const shouldUseSvgs = svgs.length > 0;
    setUseSvgs(shouldUseSvgs);

    let icons = [];
    if (shouldUseSvgs) {
      // Sử dụng danh sách SVG files

      icons = svgs.map((svg) => svg.replace('.svg', ''));
    } else {
      // Sử dụng LucideIcons như cũ
      icons = Object.keys(LucideIcons).filter((item) => !(item.search(/Icon|Lucide|icons/g) > -1));
    }

    setIconList(icons);

    // Hiển thị số lượng icon ban đầu
    setDisplayedIcons(icons.slice(0, itemsPerLoad));
    setHasMore(icons.length > itemsPerLoad);
  }, [svgs]);

  // Xử lý khi từ khóa tìm kiếm thay đổi
  useEffect(() => {
    const filteredIcons = searchTerm
      ? iconList.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      : iconList;

    // Reset lại danh sách hiển thị khi tìm kiếm thay đổi
    setDisplayedIcons(filteredIcons.slice(0, itemsPerLoad));
    setHasMore(filteredIcons.length > itemsPerLoad);
  }, [searchTerm, iconList]);

  // Lấy toàn bộ danh sách icon đã được lọc theo từ khóa tìm kiếm
  const getFilteredIcons = () => {
    return searchTerm
      ? iconList.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      : iconList;
  };

  // Hàm load thêm icon
  const loadMoreIcons = () => {
    const filteredIcons = getFilteredIcons();
    const currentLength = displayedIcons.length;

    // Nếu đã hiển thị hết, không load thêm nữa
    if (currentLength >= filteredIcons.length) {
      setHasMore(false);
      return;
    }

    // Thêm icons vào danh sách hiển thị
    const newIcons = filteredIcons.slice(currentLength, currentLength + itemsPerLoad);
    setDisplayedIcons([...displayedIcons, ...newIcons]);

    // Kiểm tra xem còn icons để load không
    setHasMore(currentLength + itemsPerLoad < filteredIcons.length);
  };

  // Render icon preview (hiển thị icon được chọn)
  const renderSelectedIcon = () => {
    if (!value) return null;

    if (useSvgs) {
      // Nếu dùng SVG, hiển thị bằng img tag
      const svgFileName = value.includes('.svg') ? value : `${value}.svg`;

      return (
        <div className='p-2 rounded bg-black/10'>
          <img
            src={`/icons/${tenant._id}/${svgFileName}`}
            alt={value}
            className='w-8 h-8 object-contain'
          />
        </div>
      );
    } else {
      // Nếu dùng LucideIcons
      const Icon = LucideIcons[value];
      if (Icon) {
        return (
          <div className='p-2 rounded bg-black/10'>
            <Icon
              alt='Icon'
              className='object-contain text-black/60 size-[24px]'
            />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className='flex items-center gap-5 pt-2'>
      <Button
        className='flex items-center gap-2'
        variant='outline'
        onClick={() => setOpen(true)}>
        <LucideIcons.CirclePlus className='size-4' />
        <p className='text-sm'>Select Icon</p>
      </Button>
      {renderSelectedIcon()}
      <Sheet
        open={open}
        onOpenChange={setOpen}>
        <SheetContent className='sm:max-w-[70%] overflow-hidden flex flex-col'>
          <SheetHeader className=''>
            <SheetTitle>Icon</SheetTitle>
          </SheetHeader>
          <div className='flex flex-col gap-4 w-full flex-1 h-0'>
            {/* Ô tìm kiếm */}
            <div className='flex items-center border rounded-md h-8 p-2'>
              {LucideIcons.Search && (
                <LucideIcons.Search
                  size={16}
                  className='mr-2 text-gray-400'
                />
              )}
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                placeholder='Tìm kiếm icon...'
                className='w-full outline-none bg-transparent text-sm'
              />
              {searchTerm && LucideIcons.X && (
                <button
                  className='text-gray-400 hover:text-gray-600'
                  onClick={() => {
                    setSearchTerm('');
                  }}>
                  <LucideIcons.X size={16} />
                </button>
              )}
            </div>

            {/* Hiển thị số lượng icon tìm thấy */}
            <div className='text-sm text-gray-500'>
              {getFilteredIcons().length} icon{getFilteredIcons().length !== 1 ? 's' : ''} found
              {useSvgs && <span className='ml-2 text-blue-500'>(Using SVG files)</span>}
            </div>

            {/* Grid hiển thị các icon với infinite scroll */}
            <div
              id='icon-scrollable-container'
              className='flex flex-1 overflow-y-auto relative [&>div]:h-0'>
              <InfiniteScroll
                dataLength={displayedIcons.length}
                next={loadMoreIcons}
                hasMore={hasMore}
                loader={
                  <div className='flex justify-center p-4'>
                    <LucideIcons.Loader className='animate-spin' />
                  </div>
                }
                scrollableTarget='icon-scrollable-container'>
                <div className='grid grid-cols-4 gap-3 md:grid-cols-8 lg:grid-cols-10'>
                  {displayedIcons.map((iconName) => {
                    const isSelected = value === iconName;

                    return (
                      <div
                        key={iconName}
                        onClick={() => {
                          onChange(iconName);
                          setOpen(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-md transition-all hover:bg-black/10 cursor-pointer
                    ${
                      isSelected
                        ? 'bg-secondary text-secondary-foreground ring-2 ring-primary'
                        : 'bg-primary-foreground'
                    }`}>
                        <div className='h-10 w-10 flex items-center justify-center'>
                          {useSvgs ? (
                            // Hiển thị SVG bằng img tag
                            <img
                              src={`/icons/${tenant._id}/${iconName.includes('.svg') ? iconName : `${iconName}.svg`}`}
                              alt={iconName}
                              className='w-8 h-8 object-contain'
                              onError={(e) => {
                                // Fallback nếu không load được SVG
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : (
                            // Hiển thị LucideIcon
                            (() => {
                              const IconComponent = LucideIcons[iconName];
                              const isValidComponent =
                                IconComponent &&
                                (typeof IconComponent === 'function' ||
                                  (typeof IconComponent === 'object' && IconComponent.$$typeof));

                              return isValidComponent ? (
                                <IconComponent size={24} />
                              ) : (
                                <div className='w-6 h-6 bg-gray-200 rounded-md'></div>
                              );
                            })()
                          )}
                          {/* Fallback div cho SVG lỗi */}
                          {useSvgs && (
                            <div
                              className='w-6 h-6 bg-gray-200 rounded-md'
                              style={{ display: 'none' }}
                            />
                          )}
                        </div>
                        <span className='text-xs mt-2 truncate w-full text-center'>{iconName}</span>
                      </div>
                    );
                  })}
                </div>
              </InfiniteScroll>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default IconEdit;
