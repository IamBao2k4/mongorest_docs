import { Image } from '@/components/ui/Image';
import { Link } from '@/components/ui/Link';
import { cn } from '@/lib/utils';

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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const generateCardType = (index) => {
    const row = Math.floor(index / 2); // vì index bắt đầu từ 0
    const isFirstInRow = index % 2 === 0;

    if (row % 2 === 0) {
      return isFirstInRow ? 'base' : 'large';
    } else {
      return isFirstInRow ? 'large' : 'base';
    }
  };

  const cardType = generateCardType(displayIndex);

  return (
    <Link
      href={href}
      key={_id}
      className={`group block ${cardType === 'base' && 'self-center'}`}>
      <div className='flex w-full flex-col gap-2 md:gap-4 lg:gap-6'>
        {/* Hình ảnh */}
        <div
          className={cn(
            'relative aspect-[16/9] w-full overflow-hidden rounded-[8px]',
            cardType === 'base'
              ? 'sm:aspect-[16/9] lg:aspect-auto lg:h-[350px]'
              : 'lg:acspect-auto sm:aspect-[5/4] lg:h-[480px]',
            'mb-3'
          )}>
          <Image
            src={feature_images?.[0]?.path}
            alt={title}
            fill
            className='rounded-[8px] object-cover transition-all duration-300 group-hover:scale-110'
          />
        </div>

        {/* Nội dung */}
        <div className='px-2 text-center'>
          <h3 className='group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold text-[#272727] transition-colors sm:text-xl'>
            {title}
          </h3>
          <p className='mb-2 line-clamp-2 text-sm font-light text-[#727272] sm:text-base'>
            {short_description}
          </p>
          <span className='text-sm font-light text-[#727272] sm:text-base'>
            {formatDate(created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CardColumn;
