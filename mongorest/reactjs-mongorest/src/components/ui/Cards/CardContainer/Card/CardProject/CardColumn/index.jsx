import { Image } from '@/components/ui/Image';
import { Link } from '@/components/ui/Link';
import LinkWithArrow from '@/components/ui/LinkWithArrow';

const CardColumn = ({
  _id,
  feature_images,
  title,
  short_description,
  created_at,
  displayIndex,
  slug,
  href,
  ...props
}) => {
  const isFullRow = (displayIndex + 1) % 5 === 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  const renderFullRow = () => {
    return (
      <div
        key={_id}
        // href={href ?? '#'}
        className='group col-span-2 flex flex-col gap-6 gap-x-6 lg:flex-row lg:items-center xl:gap-[72px]'>
        <div
          className={`relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-[380px] lg:flex-1`}>
          <Image
            src={feature_images?.[0]?.path}
            alt={title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
        </div>
        <div className={`flex flex-col items-center space-y-4 text-center lg:flex-1`}>
          <h3 className='text-lg font-normal text-[#272727] sm:text-xl'>{title}</h3>
          <p className='line-clamp-4 text-sm font-light text-[#727272] sm:text-base'>
            {short_description}
          </p>
          <span className='block text-sm text-[#C0BDBD] sm:text-base'>
            {formatDate(created_at)}
          </span>
          <LinkWithArrow
            href={href ?? '#'}
            title='ĐỌC THÊM'
          />
        </div>
      </div>
    );
  };
  const renderNormal = () => {
    return (
      <Link
        key={_id}
        href={href ?? '#'}>
        <div className='relative mb-2 h-[380px] w-full overflow-hidden rounded-lg sm:mb-0'>
          <Image
            src={feature_images?.[0]?.path}
            alt={title}
            fill
          />
        </div>
        <h3 className='mt-4 line-clamp-3 text-base font-normal md:text-lg lg:mt-6 lg:text-xl'>
          {title}
        </h3>
      </Link>
    );
  };

  if (isFullRow && displayIndex !== 0) {
    return renderFullRow();
  } else {
    return renderNormal();
  }
};

export default CardColumn;
