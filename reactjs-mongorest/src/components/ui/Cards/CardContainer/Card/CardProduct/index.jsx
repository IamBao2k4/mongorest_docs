import { Image } from '@/components/ui/Image';
import { Link } from '@/components/ui/Link';
export const LAYOUT_CARD_ROW = '1';

const CardProduct = ({ _id, title, sku, href, lang, category }) => {
  const _urlImg = `${import.meta.env.VITE_MINIO_CDN}/tav/${sku}/default.png`;
  return (
    <div
      className='h-full flex flex-col group transform duration-500 hover:-translate-y-1'
      key={_id}>
      <Link
        href={href}
        className='w-full h-full mb-5 bg-[#F8F8F8]'
        lang={lang}>
        <div className='h-[290px] w-full relative shrink-0 overflow-hidden'>
          <Image
            src={_urlImg}
            fill
            className='object-cover transform duration-300 group-hover:scale-110'
          />
        </div>
      </Link>
      <Link
        href={href}
        lang={lang}>
        <h3 className='text-[16px] line-clamp-2 mb-3 text-[#272727]'>{title}</h3>
      </Link>
      <div className='flex gap-2'>
        {category?.map((item) => {
          return (
            <Link
              key={item?._id}
              href={href}
              lang={lang}>
              <h3 className='text-[16px] text-[#C0BDBD]'>{item?.title}</h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CardProduct;
