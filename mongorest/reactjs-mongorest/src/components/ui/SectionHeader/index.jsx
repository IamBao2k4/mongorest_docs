'use client';

import LinkWithArrow from '@/components/ui/LinkWithArrow';

const SectionHeader = ({
  title,
  viewAllHref = '#',
  viewAllText = 'XEM TẤT CẢ',
  titleFieldWrapper,
  linkFieldWrapper,
  showViewAll = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex justify-between items-center mb-6 lg:mb-8 ${className}`}
      {...props}>
      <h2
        field-wrapper={titleFieldWrapper}
        className='text-base sm:text-lg lg:text-xl font-normal text-[#272727] uppercase'>
        {title}
      </h2>
      {showViewAll && (
        <LinkWithArrow
          href={viewAllHref}
          title={viewAllText}
          fieldWrapper={linkFieldWrapper}
        />
      )}
    </div>
  );
};

export default SectionHeader;
