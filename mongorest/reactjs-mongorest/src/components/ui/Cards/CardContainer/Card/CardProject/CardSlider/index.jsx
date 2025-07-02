import { Image } from '@/components/ui/Image';
import { Link } from '@/components/ui/Link';

const CardSlider = ({
  _id,
  feature_images,
  title,
  short_description,
  created_at,
  displayIndex,
  slug,
  href,
  category,
  ...props
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      key={_id}
      className='block w-full min-w-0 space-y-3 lg:space-y-[30px]'>
      <div className='relative aspect-[191/126] w-full overflow-hidden lg:mb-8 lg:max-w-[381px] 2xl:aspect-auto 2xl:h-[251px] 2xl:max-w-full'>
        <Image
          src={feature_images[0].path}
          alt={title}
          width={382}
          height={252}
          sizes='(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 45vw, 320px'
          className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105'
        />
      </div>

      <div className='flex items-center gap-1 text-xs font-light text-[#767676] lg:gap-2 lg:text-sm'>
        <span>{formatDate(created_at)}</span>
        <span>|</span>
        <span className='ml-2'>{category[0]?.title}</span>
      </div>

      <Link
        href={`/content/${slug}`}
        className='group-hover:text-primary text-base font-light text-[#272727] transition-colors duration-300 lg:text-xl xl:text-2xl'>
        {title}
      </Link>
    </div>
  );
};

export default CardSlider;
