import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { get_path_img } from '@/helpers/get_path_img';
import { Edit, X } from 'lucide-react';
import { useCallback, useState } from 'react';

function CardImage({ item, index, isDisable, setIdMedia, deleteImage }) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoomChange = useCallback((shouldZoom) => {
    setIsZoomed(shouldZoom);
  }, []);

  return (
    <div className='relative flex flex-col gap-2 p-2 bg-white border shadow-md shrink-0 w-max'>
      {isDisable ? null : (
        <div className='absolute top-0 right-0'>
          <div className='flex gap-1'>
            <Button
              type='button'
              size='icon'
              variant='outline'
              onClick={() => setIdMedia(item?._id)}>
              <Edit className='w-4 h-4' />
            </Button>
            <Button
              type='button'
              size='icon'
              variant='outline'
              onClick={() => deleteImage(index)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}

      <Image
        onClick={() => handleZoomChange(true)}
        alt='selected-image'
        className='object-contain w-auto h-[200px]'
        src={get_path_img(item?.path)}
      />

      {isZoomed ? (
        <div
          className='flex items-center justify-center fixed inset-0 z-50 bg-black/50'
          onClick={() => handleZoomChange(false)}>
          <Image
            alt='selected-image'
            width={700}
            height={'auto'}
            className='object-contain'
            src={get_path_img(item?.path)}
          />
        </div>
      ) : null}
    </div>
  );
}

export default CardImage;
