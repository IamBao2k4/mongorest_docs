import { Link } from '@/components/ui/Link';
import clsx from 'clsx';

const ShortAnswerTable = ({ onClick, href, value }) => {
  const Component = onClick ? 'div' : Link;
  const props = onClick ? { onClick } : { href: href || '/' };
  const _value =
    value && (Array.isArray(value) || typeof value === 'object') ? JSON.stringify(value) : value;
  return (
    <Component {...props}>
      <p
        className={clsx(
          `font-medium line-clamp-1 text-default-black`,
          href ? 'text-sm text-default-link' : 'text-xs text-default-black',
          href || onClick ? 'cursor-pointer' : ''
        )}>
        {_value?.length > 125 ? _value?.slice(0, 125) + '...' : _value}
      </p>
    </Component>
  );
};
export default ShortAnswerTable;
