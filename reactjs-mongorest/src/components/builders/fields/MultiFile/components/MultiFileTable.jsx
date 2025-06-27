import { Image } from '@/components/ui/Image';
import { get_path_img } from '@/helpers/get_path_img';

const FileTable = ({ onClick, value }) => {
  if (value && !Array.isArray(value)) return <></>;

  return value?.length > 0 ? (
    <div className='flex gap-1'>
      {value?.map((item) => {
        return (
          <Image
            className='h-[18px] w-auto object-contain rounded-[4px]'
            src={get_path_img(item?.path)}
          />
        );
      })}
    </div>
  ) : null;
};
export default FileTable;
