import { Image } from '@/components/ui/Image';
import LinkWithArrow from '@/components/ui/LinkWithArrow';
import { cn } from '@/lib/utils';

const CardRow = ({
  _id,
  feature_images,
  title,
  short_description,
  created_at,
  displayIndex,
  href,
  ...props
}) => {
  const isReversed = displayIndex % 2 !== 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div
      key={_id}
      className='flex w-full flex-col items-center gap-4 sm:flex-row sm:gap-0'>
      <div
        className={cn(
          'relative h-[200px] w-full sm:w-1/2 lg:h-[420px]',
          isReversed ? 'order-1 lg:order-2' : ''
        )}>
        <Image
          src={feature_images?.[0]?.path}
          alt={title}
          className='h-full w-full object-cover'
          fill
          sizes='(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 45vw, 320px'
        />
      </div>
      <div
        className={cn(
          'flex w-full flex-col items-center space-y-4 text-center sm:w-1/2 sm:px-[36px]',
          isReversed ? 'order-2 lg:order-1' : ''
        )}>
        <h3 className='text-lg font-normal text-[#272727] sm:text-xl'>{title}</h3>
        <p className='line-clamp-4 text-sm font-light text-[#727272] sm:text-base'>
          {short_description}
        </p>
        <span className='block text-sm text-[#C0BDBD] sm:text-base'>{formatDate(created_at)}</span>
        <LinkWithArrow
          href={href}
          title='ĐỌC THÊM'
        />
      </div>
    </div>
  );
};

export default CardRow;
