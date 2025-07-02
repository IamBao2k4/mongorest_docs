import { Image } from '@/components/ui/Image';
import { Link } from '@/components/ui/Link';
import clsx from 'clsx';

const CardProductV2 = ({ _id, title, sku, href, lang, category, layout }) => {
  const _urlImg = `${import.meta.env.VITE_MINIO_CDN}/tav/${sku}/default.png`;

  return (
    <div
      key={_id}
      className='flex flex-col gap-[18px]'>
      <div className='bg-muted group relative aspect-square overflow-hidden'>
        <Link
          href={href}
          lang={lang}
          className='block h-full w-full'>
          <div className='relative aspect-[270/270] overflow-hidden px-5'>
            <Image
              src={_urlImg}
              alt={title}
              fill
              className='!relative object-contain transition-transform duration-500 group-hover:scale-105'
            />
          </div>
        </Link>
      </div>
      <div className='flex flex-col gap-3'>
        <Link
          href={href}
          lang={lang}
          className='block'>
          <h3
            className={clsx(
              'hover:text-primary line-clamp-1 text-sm font-light uppercase transition-colors md:text-base',
              layout === '7' ? 'text-left' : 'text-center'
            )}>
            {title}
          </h3>
        </Link>
        {category?.[0]?.title && category?.[0]?.slug && (
          <Link
            href={category?.[0]?.slug}
            lang={lang}
            className='flex justify-center'>
            <span
              className={clsx(
                'text-center text-xs font-normal text-[#C0BDBD] md:text-sm lg:text-[15px]',
                layout === '7' ? 'text-left' : 'text-center'
              )}>
              {category[0]?.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CardProductV2;
