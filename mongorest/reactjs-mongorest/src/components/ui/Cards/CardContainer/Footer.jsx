'use client';

import { Button } from '@/components/ui/Button';
import { lazy } from 'react';

const Pagination = lazy(() => import('../../Pagination/Pagination'));

function Footer({ mode, onChangePage, meta, page, limit, isLoadingLoadmore }) {
  if (
    ((meta?.current_page ?? 0) >= (meta?.last_page ?? 0) && mode === 'loadMore') ||
    mode === 'none'
  )
    return <></>;

  if (mode === 'pagination') {
    return (
      <div className='flex justify-end pt-10 sm:pt-[100px]'>
        <Pagination
          total={meta?.total ?? 0}
          current={page}
          pageSize={limit || meta?.per_page || 3}
          onShowSizeChange={onChangePage}
        />
      </div>
    );
  }

  if (mode === 'loadMore') {
    return (
      <div className='flex justify-center pt-10 sm:pt-[100px]'>
        <Button
          variant='outline'
          onClick={() => {
            onChangePage(page + 1);
          }}
          loading={isLoadingLoadmore}>
          <span className='px-4'> Xem thêm</span>
        </Button>
      </div>
    );
  }
}

export default Footer;
