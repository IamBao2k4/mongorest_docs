import { Image } from '@/components/ui/Image';
import { Link } from '@/components/ui/Link';
import LinkWithArrow from '@/components/ui/LinkWithArrow';

const NewsContainer1 = ({ data, dataType }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const leftNews = data.slice(0, 2);
  const centerNews = data.slice(2, 3);
  const rightNews = data.slice(3, 5);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-7 md:gap-6'>
      {/* Cột trái - 2 bài viết nhỏ */}
      <div className='grid h-full grid-cols-1 gap-4 md:col-span-2 md:gap-6'>
        {leftNews.map((newsItem, index) => {
          return (
            <div
              key={newsItem._id}
              className='group h-full'>
              {/* Link */}
              <Link
                href={`${dataType?.href}/${newsItem.slug}`}
                className='flex h-full flex-col gap-4'>
                <div className='relative h-[220px] w-full overflow-hidden rounded-md lg:aspect-auto lg:h-[180px]'>
                  <Image
                    src={newsItem?.feature_images?.[0]?.path}
                    alt={newsItem?.title}
                    fill
                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
                <div className='flex flex-col justify-between'>
                  <span className='mb-2 text-sm font-light text-[#C0BDBD]'>
                    {formatDate(newsItem?.created_at)}
                  </span>
                  <h3 className='group-hover:text-primary line-clamp-2 min-h-0 text-sm font-light text-[#272727] transition-colors sm:text-base'>
                    {newsItem?.title}
                  </h3>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Cột giữa - bài viết lớn */}
      <div className='group md:col-span-3'>
        <div className='flex flex-col gap-4'>
          {/* Link */}
          <Link
            href={`${dataType?.href}/${centerNews?.[0]?.slug}`}
            className='block overflow-hidden'>
            <div className='bg-muted relative h-[220px] overflow-hidden rounded-md lg:aspect-auto lg:h-[300px]'>
              <Image
                src={centerNews?.[0]?.feature_images?.[0]?.path}
                alt={centerNews?.[0]?.title}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
              />
            </div>
          </Link>
          <div className='space-y-2'>
            {/* Link */}
            <span className='mb-2 text-xs font-light text-[#C0BDBD]'>
              {formatDate(centerNews?.[0]?.created_at)}
            </span>
            <Link href={`${dataType?.href}/${centerNews?.[0]?.slug}`}>
              <h3 className='group-hover:text-primary line-clamp-3 min-h-0 text-sm font-light text-[#272727] transition-colors sm:text-base'>
                {centerNews?.[0]?.title}
              </h3>
            </Link>
            {centerNews?.[0]?.short_description &&
              centerNews?.[0]?.short_description.length > 0 && (
                <p className='mt-2 line-clamp-3 hidden text-xs text-[#727272] md:block'>
                  {centerNews?.[0]?.short_description}
                </p>
              )}
            <div className='hidden md:mt-2 md:block'>
              <LinkWithArrow
                href={`${dataType?.href}/${centerNews?.[0]?.slug}`}
                title={'Đọc thêm'}
                className='tranform origin-left scale-90'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải - 2 bài viết nhỏ */}
      <div className='mt-4 grid h-full grid-cols-1 gap-4 md:col-span-2 md:mt-0 md:gap-6'>
        {rightNews.map((newsItem) => (
          <div
            key={newsItem._id}
            className='group h-full'>
            {/* Link */}
            <Link
              href={`${dataType?.href}/${newsItem.slug}`}
              className='flex h-full flex-col gap-4'>
              <div className='relative h-[220px] w-full overflow-hidden rounded-md lg:aspect-auto lg:h-[180px]'>
                <Image
                  src={newsItem?.feature_images?.[0]?.path}
                  alt={newsItem?.title}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                />
              </div>
              <div className='flex flex-col justify-between'>
                <span className='mb-2 text-sm font-light text-[#C0BDBD]'>
                  {formatDate(newsItem?.created_at)}
                </span>
                <h3 className='group-hover:text-primary line-clamp-2 min-h-0 text-sm font-light text-[#272727] transition-colors sm:text-base'>
                  {newsItem?.title}
                </h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsContainer1;
