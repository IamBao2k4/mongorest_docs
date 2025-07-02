'use client';

import { Link } from '@/components/ui/Link';
import { MoveRight } from 'lucide-react';

const LinkWithArrow = ({
  href = '#',
  title = 'XEM TẤT CẢ',
  className = '',
  fieldWrapper,
  iconSize = 20,
  strokeWidth = 1,
  ...props
}) => {
  return (
    <Link
      href={href}
      field-wrapper={fieldWrapper}
      className={`group w-fit flex items-center relative ${className}`}
      {...props}>
      <div className='flex items-center relative'>
        <span className='text-[#272727] text-xs sm:text-sm font-light uppercase'>{title}</span>
        <MoveRight
          size={iconSize}
          strokeWidth={strokeWidth}
          className='ml-2 transition-transform duration-300 group-hover:translate-x-1'
        />
      </div>
      <span className='absolute -bottom-1 left-0 w-1/2 h-[1px] bg-[#272727] group-hover:w-full transition-all duration-300'></span>
    </Link>
  );
};

export default LinkWithArrow;
