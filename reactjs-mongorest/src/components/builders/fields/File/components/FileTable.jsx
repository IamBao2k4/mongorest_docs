import { Link } from '@/components/ui/Link';
import { get_path_img } from '@/helpers/get_path_img';
import clsx from 'clsx';
import IconMedia from './IconMedia';

const FileTable = ({ inforFields, path, onClick, href }) => {
  const Component = onClick ? 'div' : Link;
  const props = onClick ? { onClick } : { href: href || '/' };
  const _path = get_path_img(path);

  if (!_path) return <div></div>;

  let body = (
    <img
      className={clsx(
        'w-auto object-contain rounded-[4px]',
        inforFields?.keyTable === 'path' ? 'h-[250px]' : 'h-[140px]'
      )}
      loading='lazy'
      src={_path}
    />
  );

  if (_path?.endsWith('.mp4')) {
    body = (
      <video
        className='w-[300px] object-cover rounded-[4px] h-[250px]'
        src={_path}
        controls
      />
    );
  }

  if (_path?.endsWith('.md')) {
    body = <IconMedia type='md' />;
  }

  if (_path.endsWith('.txt')) {
    body = <IconMedia type='txt' />;
  }

  if (_path.endsWith('.pdf')) {
    body = <IconMedia type='pdf' />;
  }

  if (_path.endsWith('.mp3')) {
    body = (
      <div className='h-full w-full flex items-center'>
        <audio controls>
          <source
            src={_path}
            type='audio/mpeg'></source>
        </audio>
      </div>
    );
  }

  return <Component {...props}>{body}</Component>;
};
export default FileTable;
