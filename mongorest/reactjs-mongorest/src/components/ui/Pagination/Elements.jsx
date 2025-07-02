import { forwardRef } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/Button';
import { Link } from '../Link';

const Pagination = ({ className, ...props }) => (
  <nav
    role='navigation'
    aria-label='pagination'
    className={cn('mx-auto flex w-full justify-end', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = forwardRef(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn('flex flex-row items-center gap-[4px]', className)}
      {...props}
    />
  );
});
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));
PaginationItem.displayName = 'PaginationItem';

const PaginationLink = ({ className, isActive, size = 'icon', ...props }) => (
  <Link
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, isFirstPrev, ...props }) => {
  return (
    <PaginationLink
      aria-label='Go to previous page'
      size='default'
      className={cn('gap-1 pl-2.5', className)}
      {...props}>
      {isFirstPrev ? (
        <DoubleArrowLeftIcon className='h-4 w-4' />
      ) : (
        <ChevronLeftIcon className='h-4 w-4' />
      )}
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, isLastNext, ...props }) => {
  return (
    <PaginationLink
      aria-label='Go to next page'
      size='default'
      className={cn('gap-1 pr-2.5', className)}
      {...props}>
      {isLastNext ? (
        <div>
          <DoubleArrowRightIcon className='h-4 w-4' />
        </div>
      ) : (
        <ChevronRightIcon className='h-4 w-4' />
      )}
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}>
    <DotsHorizontalIcon className='h-4 w-4' />
    <span className='sr-only'>More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
