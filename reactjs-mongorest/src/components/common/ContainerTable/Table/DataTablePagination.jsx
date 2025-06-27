'use client';
import Pagination from '@/components/ui/Pagination/Pagination';

export function DataTablePagination({ total, table, onChangePage }) {
  const handelShowSizeChange = (current, size) => {
    onChangePage({
      current: current,
      pageSize: size,
    });
    localStorage.setItem('pageSize', size || 10);
  };

  return (
    <div className='flex items-center justify-end py-2 pr-8 h-[45px] border-t border-t-default-border'>
      <Pagination
        total={total}
        pageSize={table.getState().pagination.pageSize}
        showQuickJumper={{ goButton: <></> }}
        showTotal={(total, range) => `${total} items`}
        current={table.getState().pagination.pageIndex + 1}
        onChange={() => {}}
        pageSizeOptions={['10', '20', '50', '100', '500', '1000']}
        onShowSizeChange={handelShowSizeChange}
        showSizeChanger={true}
      />
    </div>
  );
}
